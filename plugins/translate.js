var _ = require('lodash')

function convertMatchToString (match, template) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group)
  }, template)
}

function translateVariable (data, input, options) {
  let output = input
  const re = options.match && new RegExp(options.match)
  _.each(options.to, (translator, newVariable) => {
    if (options.match) {
      const matched = input.match(re)
      if (matched) {
        data[newVariable] = convertMatchToString(matched, translator)
      } else {
        console.log('no match for', options.match, 'in', input)
        data[newVariable] = options.default
      }
    }
  })
  return (output !== undefined) ? output : options.default
}

function translate (data, config) {
  console.log('start_Translation')
  // for each variable in config
  _.each(config, (optionList, variable) => {
    // get value/s to translate
    const toTranslate = data[variable]
    // if it is a string, iterate over each and make new
    if (toTranslate && typeof toTranslate === 'string') {
      optionList.forEach((options) => {
        data[variable] = translateVariable(data, toTranslate, options)
      })
    } else if (toTranslate && Array.isArray(toTranslate)) {
      optionList.forEach((options) => {
        data[variable] = toTranslate.map(value => translateVariable(data, value, options))
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
