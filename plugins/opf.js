const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const OPF = require('open-packaging-format')

function makeOpf (data, config) {
  return new Promise((resolve, reject) => {
    const opf = new OPF()
    opf.title = data.title
    const filepath = path.join(config.directory, config.filename || 'metadata.opf')
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
