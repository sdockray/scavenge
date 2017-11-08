const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const OPF = require('open-packaging-format')
var utils = require('../utils')
var tpl = utils.tpl

function makeOpf (data, config) {
  return new Promise((resolve, reject) => {
    const dir = tpl(config.directory, data)
    const file = config.filename ? tpl(config.filename, data) : 'metadata.opf'
    const opf = new OPF()
    opf.title = data.title
    const filepath = path.join(dir, file )
    mkdirp(config.directory, (err) => {
      if (err) return reject(err)
      fs.writeFile(filepath, opf.toXML(), (e) => {
        if (e) return reject(e)
        resolve(data)
      })
    })
  })
}

module.exports = {
  onStart: a => a,
  onData: makeOpf,
  onEnd: a => a
}
