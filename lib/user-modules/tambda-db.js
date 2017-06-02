'use strict'

const _ = require('lodash')
const mongo = require('../../database')
const {ObjectID} = require('mongodb')
const md5 = require('md5')

const assertCollectionName = (name) => {
    if (name && name.length > 1 && name.match(/^[a-z-_]+$/)) {
        return name
    }
    throw new Error(`Invalid Collection Name: [${name}], just be at least 1 character, a-z, '-', and '_'`)
}

const getCollectionName = (user, collection) => {
    if (user && user.length > 1) {
        return [
            md5(user),
            user.replace(/[^a-zA-Z0-9]/ig, '_'),
            assertCollectionName(collection)
        ].join('_')
    }
    throw new Error(`Invalid User: ${user}`)
}

const passthroughTypes = new Set([RegExp, ObjectID])

const normalizeCriteria = (criteria) => {
    if (!_.isObject(criteria)) {
        return criteria
    }
    const result = Object.assign({}, criteria)
    _.each(Object.keys(result), (key) => {
        if (key === '_id' && _.isString(result[key])) {
            result[key] = ObjectID(result[key])
        } else if (passthroughTypes.has(_.get(result[key], 'constructor'))) {
            // Do Nothing
        } else if (Array.isArray(result[key])) {
            result[key] = result[key].map(normalizeCriteria)
        } else if (_.isObject(result[key])) {
            result[key] = normalizeCriteria(result[key])
        }
    })
    return result
}

const tambdaDBFactory = (user) => ({
    async insert (collection, document) {
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const {result, insertedCount, ops} = await coll.insert(document)
        if (result && result.ok && insertedCount === 1) {
            return ops[0]
        }
        throw new Error('Unable to Insert Document')
    },

    async find (collection, criteria) {
        criteria = normalizeCriteria(criteria)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const result = await coll.find(criteria).toArray()
        return result
    },

    async updateOne (collection, criteria, update) {
        criteria = normalizeCriteria(criteria)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const {result, matchedCount} = await coll.updateOne(criteria, update)
        if (result.ok) {
            return matchedCount
        }
        throw new Error('Unable to Update Document')
    },

    async updateMany (collection, criteria, update) {
        criteria = normalizeCriteria(criteria)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const {result, matchedCount} = await coll.updateMany(criteria, update)
        if (result.ok) {
            return matchedCount
        }
        throw new Error('Unable to Update Documents')
    },

    async remove (collection, criteria) {
        criteria = normalizeCriteria(criteria)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const x = await coll.deleteMany(criteria)
        const {result, deletedCount} = x
        if (result.ok) {
            return deletedCount
        }
        throw new Error('Unable to Remove Document')
    }
})

module.exports = tambdaDBFactory
