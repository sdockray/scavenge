const _ = require('lodash')
const sanitize = require('sanitize-filename')

function escapeFilename (string) {
  if (typeof string !== 'string') return string
  return string.replace(/\/+/g, '_')
}

const transforms = {
  safe: sanitize,
  fs: escapeFilename
}

function tpl (str, obj) {
  return str.replace(/\$\{(.+?)\}/g, (match, p1) => {
    const templateOptions = p1.split('|')
    const path = templateOptions.shift()
    const property = _.get(obj, path)
    return templateOptions.reduce((prev, current) => {
      if (transforms[current]) {
        return transforms[current](prev)
      }
      return prev
    }, property)
  })
}

module.exports = { tpl, escapeFilename }
