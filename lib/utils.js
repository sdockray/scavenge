const _ = require('lodash')
const sanitize = require('sanitize-filename')

function tpl (str, obj, safe) {
  return str.replace(/\$\{(.+?)(?:\|(\w+?))?\}/g, (match, p1, p2) => {
    const property = _.get(obj, p1)
    if ((!!safe || p2 === 'safe') && typeof property === 'string') {
      return sanitize(property)
    }
    return property
  })
}

module.exports = { tpl }
