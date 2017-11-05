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
    "fileDownload": {
      "url": "https://www.parliament.vic.gov.au/${pdf}",
      "directory": "${year}"
    }
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

const execute = (name, options) => (data) => {
  let action = tryToRequire(`scavenge-plugin-${name}`)
  if (!action) action = tryToRequire(name)
  if (!action) action = tryToRequire(`./plugins/${name}`)

  if (!action) console.warn('Could not resolve', name)
  else if (typeof action === 'function') {
    return action(data, options)
  }
  console.warn(name, 'is not a function')
  return data
}

function executeActions (data, actions) {
  return _.keys(actions).reduce(
    (promise, actionName) => promise.then(execute(actionName, actions[actionName])),
    Promise.resolve(data)
  )
}

function go (instructions) {
  console.log('Starting to scavenge:', instructions.origin)
  var o = osmosis.get(instructions.origin)
  o = whatsHere(o, instructions)
  o.data((data) => {
    executeActions(data, instructions.actions)
      .then((results) => {
        console.log(results)
      })
  })
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