var osmosis = require('osmosis')
var PromiseQueue = require('a-promise-queue')
var _ = require('lodash')

const defaults = {
  concurrency: 5,
  delayBetweenPages: 1000
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
  if (!plugin) plugin = tryToRequire(`../plugins/${name}`)
  if (!plugin) {
    console.warn('Could not resolve', name)
    return null
  }
  return _.extend(plugin, { options })
}

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
  // Pagination
  if (conf.paginate) {
    o = o.paginate(conf.paginate)
  }
  // Filters data object by one of its properties and a regular expression
  if (conf.filter) {
    o = o.then(function (context, data, next, done) {
      const filter = _.keys(conf.filter).every(key => data[key] && data[key].match(new RegExp(conf.filter[key])))
      if (filter) {
        next(context, data)
      } else {
        // The final done() is never called unless I include this, but I'm not 100% sure.
        done()
      }
    })
  }
  // Next usually defines a link to follow and more to do recursively
  if (conf.next) {
    if (conf.next.follow) {
      o = o.delay(defaults.delayBetweenPages).follow(conf.next.follow)
    }
    o = whatsHere(o, conf.next)
  }
  return o
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

function scrape (instructions, plugins) {
  const queue = new PromiseQueue(null, instructions.concurrency || defaults.concurrency)
  var o = osmosis.get(instructions.origin)
  o = whatsHere(o, instructions)
  o.then((context, data, next, done) => {
    queue.add(() => execute(_.clone(data), plugins, 'onData').then(done))
  })
  .done(() => {
    console.log('NEARLY DONE')
    execute(null, plugins, 'onEnd')
      .then(() => {
        console.log('DONE!')
      })
  })
  .error(console.log)
}

function processData (instructions, plugins, data) {
  const queue = new PromiseQueue(null, instructions.concurrency || defaults.concurrency)
  _.each(data, d => {
    queue.add(() => execute(_.clone(data), plugins, 'onData'))
  })
  return queue.add(() => execute(null, plugins, 'onEnd')
    .then(() => {
      console.log('DONE!')
    })
  )
}

function go (instructions, data) {
  const plugins = _.mapValues(instructions.actions, resolvePlugin)
  if (instructions.delay && !isNaN(instructions.delay)) {
    // is there a way for this not to be global.
    defaults.delayBetweenPages = parseInt(instructions.delay)
  }
  if (data) {
    console.log('Running actions from data. Length:', data.length)
  } else {
    console.log('Starting to scavenge:', instructions.origin)
    console.log('Pause between requests:', defaults.delayBetweenPages, 'milliseconds')
  }
  // start actions
  execute(instructions, plugins, 'onStart')
    .then((transformedInstructions) => {
      // if no data provided, then go get it
      if (!data) {
        return scrape(transformedInstructions, plugins)
      }
      // otherwise iterate over data
      return processData(transformedInstructions, plugins, data)
    })
    .catch(e => console.log('eeerrr', e))
}

module.exports = {
  go,
  /* exports for testing */
  _processData: processData,
  _scrape: scrape,
  _execute: execute,
  _executeMethod: executeMethod,
  _whatsHere: whatsHere,
  _resolvePlugin: resolvePlugin
  /* end exports for testing */
}
