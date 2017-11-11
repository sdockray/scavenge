var scavenge = require('./lib/scavenge')

// Instructions are a JSON object describing the scavenge task
function go (instructions, data) {
  // require action plugins
  if (data) {
    scavenge.goActions(instructions, data)
  } else {
    scavenge.goScrape(instructions)
  }
}

module.exports = go
