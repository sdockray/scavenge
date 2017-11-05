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
    "./plugins/translate": {
      "pdf": [{
        "match": "(\\d+)_([A-Za-z]+)_(\\d+)\\.pdf",
        "to": {
          "day": "$1",
          "month": "$2",
          "year": "$3"
        }
      }]
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

function executeActions (data, actions) {
  return _.keys(actions).reduce((prev, actionName) => {
    try {
      var action = require(actionName)
      return action(prev, actions[actionName])
    } catch (e) {
      console.warn('Could not resolve', actionName)
      return prev
    }
  }, data)
}

function go () {
  var instructions = instructionsVictoria
  console.log('Starting to scavenge:', instructions.origin)
  var o = osmosis.get(instructions.origin)
  o = whatsHere(o, instructions)
  o.data((data) => {
    var results = executeActions(data, instructions.actions)
    console.log('listing', results)
  })
  /*
  o.log(console.log)
  .error(console.log)
  .debug(console.log);
  */
}

go()
