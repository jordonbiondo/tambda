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
            const {user, scriptName} = req.params
            const vm = buildVM(user)
            const url = buildTildeURL(user, scriptName)
            try {
                const output = await request(url)
                let tambdaFn = vm.run(output)

                if (!(tambdaFn instanceof Function)) {
                    res
                        .status(422)
                        .send(`The following script is not a valid tambda method: ${url}`)
                    return
                }

                const result = await tambdaFn(_.cloneDeep(req.body))
                res.status(200).send(result)
            } catch (e) {
                if (e && e.statusCode === 404) {
                    res.status(400).send(`No script found at ${url}`)
                    return
                }
                next(e)
            }
        }
    ])
