var _ = require('lodash')
var utils = require('../utils')
var tpl = utils.tpl
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')

/*
  Config options
  filepath: where to save the manifest (no template variables allowed!)
  dataName: name of the array of data. defaults to data @TODO!
  properties: list of variable names to include as properties in the manifest
  overwrite: overwrite an existing manifest? defaults to true
 */

var manifest
var manifestPath
var overwrite = true

function start (instructions, options) {
  return new Promise((resolve, reject) => {
    try {
      manifestPath = (options.filepath) ? options.filepath : undefined
      overwrite = !(_.has(options, 'overwrite') && options.overwrite === false)
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
      manifest.data.push(finalized)
      resolve(data)
    } catch (e) {
      console.log(e)
      resolve(data)
    }
  })
}

function writeManifest() {
  return new Promise((resolve, reject) => {
    try {
      if (manifestPath) {
        if (!overwrite && fs.existsSync(manifestPath)) {
          console.log('Skipping manifest because it already exists')
          resolve(true)
        } else {
          console.log('Writing manifest to:', manifestPath)
          mkdirp(path.dirname(manifestPath), function (err) {
            if (err) throw err
            fs.writeFile(manifestPath, JSON.stringify(manifest), function(err) {
              if (err) throw err
              resolve(true)
            }) 
          })
        }
      } else {
        console.log(manifest)
      }
      resolve(true)
    } catch (e) {
      console.log(e)
      resolve(false)
    }
  })
  
  
  
  
}


module.exports = {
  onStart: start,
  onData: addData,
  onEnd: writeManifest
}