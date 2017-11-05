var _ = require('lodash')

function convertMatchToString (match, template) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group)
  }, template)
}

function translate (data, config) {
  _.each(config, (optionList, variable) => {
    const toTranslate = data[variable]
    if (toTranslate && typeof toTranslate === 'string') {
      optionList.forEach((options) => {
        var re = new RegExp(options.match)
        var match = toTranslate.match(re)
        if (match) {
          _.each(options.to, (translator, newVariable) => {
            data[newVariable] = convertMatchToString(match, translator)
          })
        } else {
          console.log('no match for', options.match, 'in', toTranslate)
        }
      })
    } else {
      console.log('warning', variable, 'is was not found and cannot be translated')
    }
  })
  return data
}

module.exports = translate
