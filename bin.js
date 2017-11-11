#!/usr/bin/env node
var cli = require('commander')
var _ = require('lodash')
var pkg = require('./package.json')
var scavenge = require('.')

console.log('Preparing to scavenge...')

cli
  .version(pkg.version)
  .usage('<configuration>')
  .description('Scrape a website according to JSON configuration and execute some actions with the data')
  .option('-u, --username <username>', 'Username to use in case of login')
  .option('-p, --password <password>', 'Password to use in case of login')
  .option('-s, --save <save>', 'File to save scrape results to. No other actions will be executed')
  .option('-o, --open <open>', 'File with scraped data to load. No scraping will be done.')
  .option('-z, --stop', 'Stops scavenge before executing any actions')
  .parse(process.argv)

if (typeof cli.args[0] === 'undefined') {
  console.error('No JSON configuration given!')
  process.exit(1)
}

// Loads an external JSON file with scavenging instructions
var configuration = cli.args[0]
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
    _.set(instructions, 'actions', {save: { filepath: cli.save }})
  }
  if (cli.open) {
    // For now saving means that no actions will run except the save action
    try {
      data = require(cli.open).data
    } catch (e) {
      console.log('Cannot open data:', cli.open)
      process.exit(1)
    }
  }
  scavenge(instructions, data)
} else {
  console.warn('Could not load JSON configuration', configuration)
}
