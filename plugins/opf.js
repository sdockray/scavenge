const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const OPF = require('open-packaging-format')
var utils = require('../lib/utils')
var tpl = utils.tpl

// simple assignment options
const properties = [
  'cover',
  'description',
  'type',
  'format',
  'coverage',
  'rights',
  'source',
  'title',
  'authors',
  'contributors',
  'subjects',
  'publishers',
  'languages'
]

function makeOpf (data, config) {
  return new Promise((resolve, reject) => {
    const dir = tpl(config.directory, data)
    const file = config.filename ? tpl(config.filename, data) : 'metadata.opf'
    const opf = new OPF.OPF()

    properties.forEach((property) => {
      const variable = config[property]
      const propertyValue = data[variable || property]
      if (propertyValue) opf[property] = propertyValue
    })
    if (config.identifiers) {
      // check if identifiers are actually arrays
      opf.identifiers = config.identifiers.map((id, index) => {
        console.log('ok ok', id, data[id])
        return {
          id: index === 0,
          scheme: id,
          value: data[id]
        }
      })
    }

    const filepath = path.join(dir, file)
    mkdirp(dir, (err) => {
      if (err) return reject(err)
      try {
        const xml = opf.toXML()
        fs.writeFile(filepath, xml, (e) => {
          if (e) return reject(e)
          resolve(data)
        })
      } catch (e) {
        reject(e)
      }
    })
  })
}

module.exports = {
  onStart: a => a,
  onData: makeOpf,
  onEnd: a => a
}
