var _ = require('lodash')

function convertMatchToString (match, template) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group)
  }, template)
}

function translate (data, config) {
  // for each variable in config
  _.each(config, (optionList, variable) => {
    // get value to translate
    const toTranslate = data[variable]
    // if it is a string, iterate over each and make new
    // DO THIS BETTER SMARTER
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
    } else if (toTranslate && Array.isArray(toTranslate)) {
      optionList.forEach((options) => {
        var re = new RegExp(options.match)
        var matches = toTranslate.map(v => v.match(re))
        console.log(variable, matches)
        _.each(options.to, (translator, newVariable) => {
          data[newVariable] = matches.map(match => match ? convertMatchToString(match, translator) : undefined)
        })
      })
    } else {
      console.log('warning', variable, 'is was not found and cannot be translated')
    }
  })
  return data
}

module.exports = {
  onStart: a => a,
  onData: translate,
  onEnd: a => a
}
