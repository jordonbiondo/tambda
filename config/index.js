'use strict'

const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const yaml = require('js-yaml')

const configName = process.env.TAMBDA_ENV || 'development'

const loadConfig = () => {
    const content = fs.readFileSync(path.join(__dirname, `./${configName}.yml`), 'utf8')
    const params = {
        serverRoot: path.resolve(path.join(__dirname, '..')),
        ENV: process.env
    }
    return _.template(content)(params)
}

const config = yaml.safeLoad(loadConfig())

module.exports = config
