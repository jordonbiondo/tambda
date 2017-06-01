'use strict'

const MongoClient = require('mongodb').MongoClient
const {mongo} = require('../config')
let output = {db: null}
MongoClient.connect(mongo.connectionString, (err, db) => {
    if (err) {
        console.log(err)
        process.exit(-1)
    }
    console.log('Mongo Connected', `db:${db.databaseName}`)
    output.db = db
})

module.exports = output
