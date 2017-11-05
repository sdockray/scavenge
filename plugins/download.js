var request = require('request')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var utils = require('../utils')
var tpl = utils.tpl

/*
  url: required
  filepath: specify a complete path to a file
  directory: specify a directory for the downloaded file
 */


function download (data, config) {
  return new Promise((resolve, reject) => {
    try {
      if (config.url) {
        var url = tpl(config.url, data)
        var filepath = (config.filepath) ? tpl(config.filename, data) : undefined
        var dir = (config.directory) ? tpl(config.directory, data) : undefined
        if (filepath) {
          mkdirp(path.dirname(filepath))
        } else if (dir) {
          mkdirp(dir)
          var filename = path.basename(url)
          filepath = path.join(dir, filename)
        }
        // Stream downloaded file into filesystem
        request(url).pipe(fs.createWriteStream(filepath))
      }
      resolve(data)
    } catch (e) {
      resolve(data)
    }
  })
}

module.exports = {
  onStart: a => a,
  onData: fileDownload,
  onEnd: a => a
}
