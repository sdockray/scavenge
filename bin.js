#!/usr/bin/env node
var cli = require('commander')
var _ = require('lodash')
var pkg = require('./package.json')
var scavenge = require('.')

var configuration
var overrides = []

console.log('Preparing to scavenge...')

cli
  .version(pkg.version)
  .usage('<configuration> [...overrides]')
  .action(function (c, ...o) {
    configuration = c
    _.forEach(o, (override) => {
      if (_.isString(override)) {
        var parts = _.split(override, '=')
        if (parts.length === 2) overrides.push(parts)
      }
    })
  })
  .description('Scrape a website according to JSON configuration and execute some actions with the data')
  .option('-u, --username <username>', 'Username to use in case of login')
  .option('-p, --password <password>', 'Password to use in case of login')
  .option('-s, --save <save>', 'File to save scrape results to. No other actions will be executed')
  .option('-l, --load <load>', 'File with scraped data to load. No scraping will be done.')
  .option('-z, --stop', 'Stops scavenge before executing any actions')
  .parse(process.argv)

if (configuration === 'undefined') {
  console.error('No JSON configuration given!')
  process.exit(1)
}

// console.log(cli.args)

// Loads an external JSON file with scavenging instructions
var instructions
var data
try {
  instructions = require(configuration)
} catch (e) {
  console.log('Cannot require', configuration)
}
if (instructions) {
  if (cli.username) {
    _.set(instructions, 'login.username', cli.username)
  }
  if (cli.password) {
    _.set(instructions, 'login.password', cli.password)
  }
  if (cli.stop) {
    _.set(instructions, 'actions', {})
  }
  if (cli.save) {
    // For now saving means that no actions will run except the save action
    _.set(instructions, 'actions', { save: { filepath: cli.save } })
  }
  if (cli.load) {
    // For now saving means that no actions will run except the save action
    try {
      data = require(cli.load).data
    } catch (e) {
      console.log('Cannot load data:', cli.load)
      process.exit(1)
    }
  }
  // Apply the overrides
  _.forEach(overrides, function (override) {
    _.set(instructions, override[0], override[1])
  })
  scavenge(instructions, data)
} else {
  console.warn('Could not load JSON configuration', configuration)
}
