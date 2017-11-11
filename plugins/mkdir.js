var mkdirp = require('mkdirp')
var utils = require('../lib/utils')
var tpl = utils.tpl

// This is a super-simple plugin for creating a directory

/*
  directory: specify a directory name
 */

function mkdir (data, config) {
  return new Promise((resolve, reject) => {
    if (config.directory) {
      var dir = tpl(config.directory, data)
      mkdirp(dir, (err) => {
        if (err) return reject(err)
        resolve(data)
      })
    }
    resolve(data)
  })
}

module.exports = {
  onStart: a => a,
  onData: mkdir,
  onEnd: a => a
}
