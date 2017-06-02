'use strict'

const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const crypto = require('crypto')
/* const database = */ require('./database')

const server = express()
server.use(bodyParser.json())

server.use((req, res, next) => {
    req.reqId = crypto.randomBytes(8).toString('hex').toUpperCase()
    next()
})

morgan.token('reqId', function (req, res) { return req.reqId })
server.use(morgan(':reqId :method :url', {immediate: true}))
server.use(morgan(':reqId :method :url :status :res[content-length] - :response-time ms'))

const userAPI = require('./user-api')
server.use('/tambda/', userAPI)

// server.use((err, req, res, next) => {
//     next(err)
// })

server.listen(config.http.port, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Tambda Server Started! port:${config.http.port}`)
    }
})
