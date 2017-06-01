'use strict'

const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
/* const database = */ require('./database')

const server = express()
server.use(bodyParser.json())

const userAPI = require('./user-api')
server.use('/tambda/', userAPI)

server.listen(config.http.port, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Tambda Server Started! port:${config.http.port}`)
    }
})
