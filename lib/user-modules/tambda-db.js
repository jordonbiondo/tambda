const mongo = require('../../database')
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

module.exports = (user) => ({
    async insert (collection, document) {
        assertCollectionName(collection)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const {result, insertedCount, ops} = await coll.insert(document)
        if (result && result.ok && insertedCount === 1) {
            return ops[0]
        }
        throw new Error('Unable to Insert Document')
    },

    async find (collection, criteria) {
        assertCollectionName(collection)
        const coll = mongo.db.collection(getCollectionName(user, collection))
        const result = await coll.find(criteria).toArray()
        return result
    }
})
