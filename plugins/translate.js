var _ = require('lodash')

var caseTranslationFuncs = {
  sentence: _.capitalize,
  title: str => _.capitalize(_.toLower(str)),
  heading: _.startCase,
  lower: _.lowerCase,
  upper: _.upperCase,
  lowerFirst: _.lowerFirst,
  upperFirst: _.upperFirst,
  camel: _.camelCase,
  kebab: _.kebabCase,
  snake: _.snakeCase,
  deburr: _.deburr,
  toLower: _.toLower,
  toUpper: _.toUpper,
  parseInt: _.parseInt,
  trim: str => str && str.trim()
}

function mapSingleOrArray (input, fn) {
  if (Array.isArray(input)) {
    // this runs recursively to call fn will all items in nested in input the array.
    return input.map(v => mapSingleOrArray(v, fn))
  }
  return fn(input)
}

function transformString (input, transformOption) {
  if (Array.isArray(transformOption)) {
    return transformOption.reduce((p, option) => {
      const fn = caseTranslationFuncs[option]
      return fn ? fn(p) : p
    }, input)
  }
  const fn = caseTranslationFuncs[transformOption]
  return fn(input)
}

function convertMatchToString (match, template, fallback) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group || fallback)
  }, template)
}

function replaceString (string, replaceRegex, withString = '') {
  return string.replace(new RegExp(replaceRegex, 'g'), withString)
}

function splitString (string, token) {
  return string.split(token === true ? ',' : token)
}

function translateVariable (data, input, options) {
  let output = input
  if (output === undefined) return options.default
  // first optionally replace
  if (options.replace) {
    output = mapSingleOrArray(output, v => replaceString(v, options.replace, options.with))
  }
  // then optionally split variable into array - could can in [[],[]] if input is an array.
  if (options.split) {
    output = mapSingleOrArray(output, v => splitString(v, options.split))
  }
  // optionally perform match on all strings
  if (options.match) {
    const re = new RegExp(options.match)
    _.each(options.to, (translator, newVariable) => {
      data[newVariable] = mapSingleOrArray(output, (v) => {
        const matched = v.match(re)
        if (matched) {
          const converted = convertMatchToString(matched, translator, options.default)
          // optionally transform each matched string
          return (options.transform)
            ? transformString(converted, options.transform)
            : converted
        }
        // if no match return default or undefined
        return options.default
      })
    })
  }
  // optionally perform transform on the input
  if (options.transform) {
    output = mapSingleOrArray(output, v => transformString(v, options.transform))
  }
  return output
}

function translate (data, config) {
  // for each variable in config
  _.each(config, (optionList, variable) => {
    // get value/s to translate
    const toTranslate = data[variable]
    mapSingleOrArray(optionList, (options) => {
      data[variable] = translateVariable(data, toTranslate, options)
    })
  })
  return data
}

module.exports = {
  onStart: a => a,
  onData: translate,
  onEnd: a => a
}
