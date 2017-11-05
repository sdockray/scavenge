var _ = require('lodash')
var osmosis = require('osmosis')
var PromiseQueue = require('a-promise-queue')
var queue = new PromiseQueue()

function whatsHere (o, conf) {
  if (conf.find) {
    o = o.find(conf.find)
  }
  if (conf.variables) {
    o = o.set(conf.variables)
  }
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
            console.log('getting some where!')
          })
        )
      })
      .done(() => {
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

// Loads an external JSON file with scavenging instructions
function goJsonFile (name) {
  var instructions = tryToRequire(name)
  if (instructions) {
    go(instructions)
  } else {
    console.warn('Could not load JSON configuration', name)
  }
}

// Testing entry point
goJsonFile('./examples/oz.json')

// var download = require('./plugins/download')
// download.onData(
//   { pdf: 'http://ro.uow.edu.au/cgi/viewcontent.cgi?article=1004&context=ozsydney' },
//   { url: "${pdf}",
//     filepath: "OZ/issue.pdf"
//   }).then(()=> {
//     console.log('fdsfdsfsdf');
//   })

/*
var download = require('./plugins/download')
download.onData(
  { pdf: 'http://ro.uow.edu.au/cgi/viewcontent.cgi?article=1004&context=ozsydney' },
  { url: "${pdf}",
    directory: "OZ/"
  })
  {
    year: '2017',
    yearUrl: '/hansard/daily-hansard/3389-council-2017',
    pdf: '/images/stories/daily-hansard/Council_2017/Council_Daily_Extract_Friday_20_October_2017_from_Book_17.pdf' },
  {
    url: "https://www.parliament.vic.gov.au/${pdf}",
    directory: "${year}"
  })
*/
