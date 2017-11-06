var _ = require('lodash')
var utils = require('../utils')
var tpl = utils.tpl

/*
  Config options
  filepath: where to save the manifest 
  dataName: name of the array of data. defaults to data
  properties: list of variable names to include as properties in the manifest
 */

var manifest

function start (instructions, options) {
  return new Promise((resolve, reject) => {
    try {
      manifest = { data: [] }
      resolve(instructions)
    } catch (e) {
      console.log(e)
      resolve(instructions)
    }
  })
}

function addData (data, options) {
  return new Promise((resolve, reject) => {
    try {
      var properties = options.properties
      var finalized = _.mapValues(properties, function(v) {
        return tpl(v, data)
      })
      console.log('adding',finalized)
      manifest.data.push(finalized)
      resolve(data)
    } catch (e) {
      console.log(e)
      resolve(data)
    }
  })
}

function writeManifest() {
  console.log('Writing manifest')
  console.log(manifest)
}


module.exports = {
  onStart: start,
  onData: addData,
  onEnd: writeManifest
}
