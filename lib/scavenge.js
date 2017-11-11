var osmosis = require('osmosis')
var PromiseQueue = require('a-promise-queue')
var _ = require('lodash')

var queue = new PromiseQueue(null, 10)

var delayBetweenPages // 1 second delay before following next link. Can override in JSON with 'delay'

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
      o = o.delay(delayBetweenPages).follow(conf.next.follow)
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

function queueActions (data, plugins, done) {
  queue.add(() => execute(_.clone(data), plugins, 'onData')
    .then((results) => {
      console.log(results)
    })
    .then(done)
  )
}

// Stage 1: scrape the data
function goScrape (instructions) {
  const plugins = _.mapValues(instructions.actions, resolvePlugin)
  delayBetweenPages = 1000
  if (instructions.delay && !isNaN(instructions.delay)) {
    delayBetweenPages = parseInt(instructions.delay)
  }
  console.log('Starting to scavenge:', instructions.origin)
  console.log('Pause between requests:', delayBetweenPages, 'milliseconds')
  // start actions
  execute(instructions, plugins, 'onStart')
    .then((transformedInstructions) => {
      // console.log(transformedInstructions)
      var o = osmosis.get(transformedInstructions.origin)
      o = whatsHere(o, transformedInstructions)
      o.then((context, data, next, done) => {
        queueActions(data, plugins, done)
      })
      .done(() => {
        console.log('NEARLY DONE')
        execute(null, plugins, 'onEnd')
          .then(() => {
            console.log('DONE!')
          })
      })
      // .log(console.log)
      .error(console.log)
      // .debug(console.log)
    })
    .catch(e => console.log('eeerrr', e))
}

// Stage 2: run actions with every piece of data
function goActions (instructions, data) {
  const plugins = _.mapValues(instructions.actions, resolvePlugin)
  console.log('Running actions from data. Length:', data.length)
  execute(instructions, plugins, 'onStart')
    .then(() => {
      _.each(data, d => queueActions(d, plugins))
      queue.add(() => execute(null, plugins, 'onEnd')
        .then(() => {
          console.log('DONE!')
        })
      )
    })
    .catch(e => console.log('eeerrr', e))
}

module.exports = {
  goActions,
  goScrape,
  resolvePlugin
}
