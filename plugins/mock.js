
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
        if (filepath) {
          console.log('downloading', url, filepath);
          setTimeout(() => {
            console.log('downloaded', url, filepath);
            resolve(data)
          }, 5000)
        } else if (dir) {
          console.log('downloading', url, dir);
          setTimeout(() => {
            console.log('downloaded', url, dir);
            resolve(data)
          }, 5000)
        }
      } else {
        resolve(data)
      }
    } catch (e) {
      // console.log(e)
      reject(data)
    }
  })
}

module.exports = {
  onStart: a => a,
  onData: download,
  onEnd: a => a
}
