function index (obj, is, value) {
  if (typeof is === 'string') {
    is = is.split('.')
  }
  if (is.length === 1 && value !== undefined) {
    return obj[is[0]] = value
  } else if (is.length === 0) {
    return obj
  } else {
    return index(obj[is[0]], is.slice(1), value)
  }
}

function tpl (str, obj) {
  console.log(obj)
  return str.replace(/\$\{(.+?)\}/g, (match, p1) => { return index(obj, p1) })
}

module.exports = { tpl }
