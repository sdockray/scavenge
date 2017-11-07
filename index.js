var _ = require('lodash')
var osmosis = require('osmosis')
var PromiseQueue = require('a-promise-queue')
var queue = new PromiseQueue()

function whatsHere (o, conf) {
  if (conf.find) {
    o = o.find(conf.find)
  }
  // Sets current find value to the variable name
  if (conf.set) {
    o = o.set(conf.set)
  }
  // Sets a group of variables
  if (conf.variables) {
    o = o.set(conf.variables)
  }
  // Filters data object by one of its properties and a regular expression
  if (conf.filter && conf.filter.variable && conf.filter.regexp) {
    o = o.then(function (context, data, next, done) {
      if (data[conf.filter.variable].match(new RegExp(conf.filter.regexp))) {
        next(context, data)
      }
      // The final done() is never called unless I include this, but I'm not 100% sure.
      done()
    })
  }
  // Next usually defines a link to follow and more to do recursively
  if (conf.next) {
    if (conf.next.follow) {
      o = o.follow(conf.next.follow)
    }
    o = whatsHere(o, conf.next)
  }
  return o
}

function tryToRequire (name) {
  try {
    return require(name)
  } catch (e) {
    return null
  }
}

function resolvePlugin (options, name) {
  let plugin = tryToRequire(`scavenge-plugin-${name}`)
  if (!plugin) plugin = tryToRequire(name)
  if (!plugin) plugin = tryToRequire(`./plugins/${name}`)
  if (!plugin) {
    console.warn('Could not resolve', name)
    return null
  }
  return _.extend(plugin, { options })
}

var executeMethod = (plugins, name, event) => (previousData) => {
  const plugin = plugins[name]
  if (!plugin) return previousData
  const action = plugin[event]
  if (typeof action !== 'function') {
    console.warn(name, '->', event, 'is not a function.')
    return previousData
  }
  if (_.isArray(plugin.options)) {
    return plugin.options.reduce((p, o) => p.then(d => action(d, o)), Promise.resolve(previousData))
  } else {
    return action(previousData, plugin.options)
  }
}

function execute (data, plugins, event) {
  return _.keys(plugins).reduce(
    (promise, name) => promise.then(executeMethod(plugins, name, event)),
    Promise.resolve(data)
  )
}

// Instructions are a JSON object describing the scavenge task
function go (instructions) {
  // require action plugins
  const plugins = _.mapValues(instructions.actions, resolvePlugin)
  console.log('Starting to scavenge:', instructions.origin)
  // start actions
  execute(instructions, plugins, 'onStart')
    .then((transformedInstructions) => {
      console.log(transformedInstructions)
      var o = osmosis.get(transformedInstructions.origin)
      o = whatsHere(o, transformedInstructions)
      o.then((context, data, next, done) => {
        queue.add(() => execute(_.clone(data), plugins, 'onData')
          .then((results) => {
            console.log(results)
          })
          .then(done)
        )
      })
      .done(() => {
        console.log('NEARLY DONE')
        execute(null, plugins, 'onEnd')
          .then(() => {
            console.log('DONE!')
          })
      })
    })
    .catch(e => console.log('eeerrr', e))
  /*
  o.log(console.log)
  .error(console.log)
  .debug(console.log);
  */
}

module.exports = go
