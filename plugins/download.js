var request = require('request')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var _ = require('lodash')
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
        var filepath = (config.filepath) ? tpl(config.filepath, data) : undefined
        var dir = (config.directory) ? tpl(config.directory, data) : undefined
        var overwrite = !(_.has(config, 'overwrite') && config.overwrite === false)
        if (filepath) {
          if (!overwrite && fs.existsSync(filepath)) {
            resolve(data)
          } else {
            mkdirp(path.dirname(filepath), function (err) {
              if (err) console.error(err)
              // Stream downloaded file into filesystem
              console.log('Downloading', url, 'to', filepath)
              var req = request(url)
              var file = fs.createWriteStream(filepath)
              req.pipe(file)
              file.on('error', reject)
              file.on('close', () => resolve(data))
            })
          }
        } else if (dir) {
          mkdirp(dir, function (err) {
            if (err) console.error(err)
            var filename = path.basename(url)
            filepath = path.join(dir, filename)
            if (!overwrite && fs.existsSync(filepath)) {
              resolve(data)
            } else {
              // Stream downloaded file into filesystem
              console.log('Downloading', url, 'to', filepath)
              var req = request(url)
              var file = fs.createWriteStream(filepath)
              req.pipe(file)
              file.on('error', reject)
              file.on('close', () => resolve(data))
            }
          })
        }
      } else {
        resolve(data)
      }
    } catch (e) {
      console.log(e)
      reject(data)
    }
  })
}

module.exports = {
  onStart: a => a,
  onData: download,
  onEnd: a => a
}
