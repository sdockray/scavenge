#!/usr/bin/env node
var cli = require('commander')
var _ = require('lodash')
var scavenge = require('.')

console.log('Preparing to scavenge...')

cli
  .version('1.2.0')
  .usage('<configuration>')
  .description('Scrape a website according to JSON configuration and execute some actions with the data')
  .option('-u, --username <username>', 'Username to use in case of login')
  .option('-p, --password <password>', 'Password to use in case of login')
  .parse(process.argv)

if (typeof cli.args[0] === 'undefined') {
  console.error('No JSON configuration given!')
  process.exit(1)
}

// Loads an external JSON file with scavenging instructions
var configuration = cli.args[0]
var instructions
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
  scavenge(instructions)
} else {
  console.warn('Could not load JSON configuration', configuration)
}
