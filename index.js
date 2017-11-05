var _ = require('lodash')
var osmosis = require('osmosis')

// OZ Magazine
var instructionsOz = {
  "origin": "http://ro.uow.edu.au/ozsydney/",
  "find": "ul#gallery_items li .content_block",
  "variables": {
    "title": "h2 > a",
    "date": "#mag_pubdate",
    "cover": ".cover img@src",
    "info": ".cover@href"
  },
  "next": {
    "follow": ".cover@href",
    "find": "#alpha",
    "variables": {
      "pdf": "#alpha-pdf@href"
    }
  }
}

// State Parliament of Victoria Hansard documents
var instructionsVictoria = {
  "origin": "https://www.parliament.vic.gov.au/hansard/daily-hansard",
  "find": "#middle article table tr:nth-child(2) td:nth-child(1)",
  "variables": {
    "year": "ul li a",
    "yearUrl": "ul li a@href"
  },
  "next": {
    "follow": "ul li a@href",
    "find": "table.dl-hansard tbody tr td a",
    "variables": {
      "pdf": "@href"
    }
  },
  "actions": {
    "translate": {
      "pdf": [{
        "match": "(\\d+)_([A-Za-z]+)_(\\d+)\\.pdf",
        "to": {
          "day": "$1",
          "month": "$2",
          "year": "$3",
        }
      }]
    },
    "morph": {
      columns: ["pdf", "day", "month", "year"]
    },
    // "fileDownload": {
    //   "url": "https://www.parliament.vic.gov.au/${pdf}",
    //   "directory": "${year}"
    // }
  }
}

//
function whatsHere (o, conf) {
  console.log('whatsHere()')
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
  return action(previousData, plugin.options)
}

function execute (data, plugins, event) {
  return _.keys(plugins).reduce(
    (promise, name) => promise.then(executeMethod(plugins, name, event)),
    Promise.resolve(data)
  )
}

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
      o.then((context, data, next) => {
        execute(_.clone(data), plugins, 'onData')
          .then((results) => {
            console.log(results)
          })
          .then(next)
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

go(instructionsVictoria)
/*
executeActions(
  { url: 'http://ro.uow.edu.au/cgi/viewcontent.cgi?article=1004&context=ozsydney' },
  { fileDownload: { url: "${url}", directory: "data" }})
*/
