var path = require('path')
var utils = require('../utils')
var tpl = utils.tpl

function fileDownload (data, config) {
  if (config.url) {
    var url = tpl(config.url, data)
    var filename = (config.filename) ? tpl(config.filename, data) : path.basename(url)
    console.log(filename)
  }
  return data
}

module.exports = fileDownload
