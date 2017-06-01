'use strict'

const _ = require('lodash')
const router = require('express').Router()
const request = require('request-promise-native')
const userModuleFactory = require('./lib/user-modules/index.js')
const config = require('./config')

const buildTildeURL = (user, scriptName) => {
    return `${config.tilde.url}/~${user}/${config.tilde['user-script-dir']}/${scriptName}.js`
}

const buildVM = (user) => {
    const {NodeVM: VM2} = require('vm2')
    const vm = new VM2({
        require: {
            mock: userModuleFactory(user)
        }
    })
    const log = (...args) => console.log('SCRIPT LOG', ...args)
    vm.freeze(log, 'log')
    return vm
}
module.exports = router
    .post('/:user/:scriptName', [
        async (req, res, next) => {
            const {user} = req.params
            const vm = buildVM(user)
            try {
                const url = buildTildeURL(req.params.user, req.params.scriptName)
                const output = await request(url)
                let functionInSandbox = vm.run(output)
                const result = await functionInSandbox(_.cloneDeep(req.body))
                res.send(200, result)
            } catch (e) {
                next(e)
            }
        }
    ])
