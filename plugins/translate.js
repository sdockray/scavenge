var _ = require('lodash')

function convertMatchToString (match, template) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group)
  }, template)
}

function translateVariable (data, input, options) {
  let output = input
  if (output === undefined) return options.default
  const re = options.match && new RegExp(options.match)

  _.each(options.to, (translator, newVariable) => {
    if (options.match) {
      if (Array.isArray(input)) {
        // iterate over
        data[newVariable] = input.map((value) => {
          const matched = value.match(re)
          return matched ? convertMatchToString(matched, translator) : options.default;
        })
      } else {
        const matched = input.match(re)
        data[newVariable] = (matched) ? convertMatchToString(matched, translator) : options.default
      }
    }
  })
  return output
}

function translate (data, config) {
  console.log('start_Translation')
  // for each variable in config
  _.each(config, (optionList, variable) => {
    // get value/s to translate
    const toTranslate = data[variable]
    // if it is a string, iterate over each and make new
    // if (toTranslate === undefined || typeof toTranslate === 'string') {
    if (Array.isArray(optionList)) {
      optionList.forEach((options) => {
        data[variable] = translateVariable(data, toTranslate, options)
      })
    } else {
      data[variable] = translateVariable(data, toTranslate, optionList)
    }
    // } else if (toTranslate && Array.isArray(toTranslate)) {
    //   if (Array.isArray(optionList)) {
    //     optionList.forEach((options) => {
    //       data[variable] = toTranslate.map(value => translateVariable(data, value, options))
    //     })
    //   } else {
    //     data[variable] = toTranslate.map(value => translateVariable(data, value, optionList))
    //   }
    // } else {
    //   console.log('warning', variable, 'is was not found and cannot be translated')
    // }
  })
  return data
}

module.exports = {
  onStart: a => a,
  onData: translate,
  onEnd: a => a
}
