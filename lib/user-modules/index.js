'use strict'

const fs = require('fs')
const path = require('path')

const moduleFiles = fs.readdirSync(__dirname)
      .filter((name) => {
          const ext = path.extname(name)
          return ext === '.js' &&
              path.basename(name, ext) !== 'index' &&
              name[0] !== '.'
      })
      .map((fileName) => {
          const name = path.basename(fileName, path.extname(fileName))
          const factory = require(path.join(__dirname, name))
          return { name, factory }
      })

module.exports = (user) => {
    return moduleFiles.reduce((modules, {name, factory}) => {
        modules[name] = factory(user)
        return modules
    }, {})
}
