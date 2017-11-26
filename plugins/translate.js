var _ = require('lodash')

var caseTranslationFuncs = {
  sentence: _.capitalize,
  title: (str) => _.capitalize(_.toLower(str)),
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
  parseInt: _.parseInt
}

function mapSingleOrArray (input, fn) {
  if (Array.isArray(input)) {
    return input.map(fn)
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

function convertMatchToString (match, template) {
  return match.reduce((prev, group, index) => {
    return prev.replace(new RegExp(`\\$${index}`, 'g'), group)
  }, template)
}

function replaceString (string, replaceRegex, withString) {
  return string.replace(new RegExp(replaceRegex, 'g'), withString)
}

function translateVariable (data, input, options) {
  let output = input
  if (output === undefined) return options.default
  if (options.replace) {
    output = mapSingleOrArray(output, v => replaceString(v, options.replace, options.with))
  }
  if (options.match) {
    const re = new RegExp(options.match)
    _.each(options.to, (translator, newVariable) => {
      data[newVariable] = mapSingleOrArray(output, (v) => {
        const matched = v.match(re)
        if (matched) {
          const converted = convertMatchToString(matched, translator)
          return (options.transform)
            ? transformString(converted, options.transform)
            : converted
        }
        return options.default
      })
    })
  }
  if (options.transform) {
    return mapSingleOrArray(output, v => transformString(v, options.transform))
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
