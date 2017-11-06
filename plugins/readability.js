var read = require('node-readability')
var createHTML = require('create-html')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var _ = require('lodash')
var utils = require('../utils')
var tpl = utils.tpl

var template = '<main class="markdown-body" style="max-width: 888px; margin: 60px auto;"><h1>{{TITLE}}</h1>{{CONTENT}}</main>'
var style = fs.readFileSync(path.join(__dirname, '../node_modules/github-markdown-css/github-markdown.css'), 'utf8')

/*
  Saves HTML page for reading offline
  url: required
  filepath: specify a complete path to a file (optional)
  directory: specify a directory for the downloaded file (file will be index.html)
  overwrite: overwrite an already existing file here. defaults to true
 */

function download (data, config) {
  return new Promise((resolve, reject) => {
    try {
      if (config.url && (config.filepath || config.directory)) {
        var url = tpl(config.url, data)
        var dir = (config.directory) ? tpl(config.directory, data) : undefined
        var filepath = (config.filepath) ? tpl(config.filepath, data) : path.join(dir, 'index.html')
        var overwrite = !(_.has(config, 'overwrite') && config.overwrite === false)
        if (!overwrite && fs.existsSync(filepath)) {
          resolve(data)
        } else {
          mkdirp(path.dirname(filepath), function (err) {
            if (err) throw err
            //
            read(url, function (err, page, meta) {
              if (err) throw err
              var output = createHTML({
                head: '<style>' + style + '</style>',
                title: page.title,
                body: template
                  .replace('{{CONTENT}}', page.content)
                  .replace('{{TITLE}}', page.title)
              })
              page.close()
              fs.writeFile(filepath, output, function(err) {
                  if (err) throw err
                  resolve(data)
              })
            })
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
