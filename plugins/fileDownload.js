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

// Downloads a file at url to a specific location
function dl (url, loc) {
  console.log('Downloading: ', url)
  return request(url).pipe(fs.createWriteStream(loc))
}

function fileDownload (data, config) {
  if (config.url) {
    var url = tpl(config.url, data)
    var filepath = (config.filepath) ? tpl(config.filename, data) : undefined
    var dir = (config.directory) ? tpl(config.directory, data) : undefined
    if (filepath) {
      mkdirp(path.dirname(filepath))
      dl(url, filepath)
    } else if (dir) {
      mkdirp(dir)
      var filename = path.basename(url)
      filepath = path.join(dir, filename)
      dl(url, filepath)
    }
  }
  return data
}

module.exports = fileDownload
