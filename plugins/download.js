var request = require('request')
var path = require('path')
var mkdirp = require('mkdirp')
var validUrl = require('valid-url')
var fs = require('fs')
var _ = require('lodash')
var utils = require('../utils')
var tpl = utils.tpl

/*
  url: required. Can also be an array of urls.
  filepath: specify a complete path to a file
  directory: specify a directory for the downloaded file
 */

var counter

function init (instructions, options) {
  counter = 0
  return instructions
}

function download (data, config) {
  if (config.url && _.has(data, config.url) && _.isArray(data[config.url])) {
    return data[config.url].reduce((p, url) => p.then(d => download(data, _.assign(config, { url }))), Promise.resolve(data))
  }
  return new Promise((resolve, reject) => {
    try {
      if (config.url) {
        // console.log('HANDING SINGLE URL')
        var url = config.url
        // In case this is an object
        if (_.has(data, url)) {
          url = data[url]
        }
        url = tpl(url, data)
        var filepath = (config.filepath) ? tpl(config.filepath, data) : undefined
        var dir = (config.directory) ? tpl(config.directory, data) : undefined
        var overwrite = !(_.has(config, 'overwrite') && config.overwrite === false)
        if (validUrl.isUri(url)) {
          if (filepath) {
            if (!overwrite && fs.existsSync(filepath)) {
              console.log('Skipping download (already exists):', filepath)
              resolve(data)
            } else {
              mkdirp(path.dirname(filepath), function (err) {
                if (err) throw err
                // Stream downloaded file into filesystem
                console.log(counter, 'Downloading', url, 'to', filepath, data)
                counter++
                var req = request(url)
                var file = fs.createWriteStream(filepath)
                req.pipe(file)
                file.on('error', reject)
                file.on('close', () => {
                  counter--
                  console.log(counter, 'files still downloading')
                  resolve(data)
                })
              })
            }
          } else if (dir) {
            mkdirp(dir, function (err) {
              if (err) return reject(err)
              var filename = path.basename(url)
              filepath = path.join(dir, filename)
              if (!overwrite && fs.existsSync(filepath)) return resolve(data)
                // Stream downloaded file into filesystem
              console.log(counter, 'DIR Downloading', url, 'to', filepath)
              counter++
              var req = request(url)
              var file = fs.createWriteStream(filepath)
              req.pipe(file)
              file.on('error', reject)
              file.on('close', () => {
                counter--
                console.log(counter, 'files still downloading')
                resolve(data)
              })
            })
          }
        } else {
          // Not a valid url
          resolve(data)
        }
      } else {
        // Not a valid url
        resolve(data)
      }
    } catch (e) {
      console.log(e)
      reject(data)
    }
  })
}

module.exports = {
  onStart: init,
  onData: download,
  onEnd: a => a
}
