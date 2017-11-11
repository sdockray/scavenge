var _ = require('lodash')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')

var utils = require('../lib/utils')
var tpl = utils.tpl
/*
  Config options
  filepath: where to save the file
 */

var allData
var savePath

function start (instructions, options) {
  return new Promise((resolve, reject) => {
    try {
      savePath = (options.filepath) ? options.filepath : undefined
      if (savePath) {
        console.log('Scrape data will be saved to', savePath)
      }
      allData = { data: [] }
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
      allData.data.push(data)
      resolve(data)
    } catch (e) {
      console.log(e)
      resolve(data)
    }
  })
}

function writeFile() {
  return new Promise((resolve, reject) => {
    try {
      if (savePath) {
        console.log('Saving scrape data to:', savePath)
        mkdirp(path.dirname(savePath), function (err) {
          if (err) throw err
          fs.writeFile(savePath, JSON.stringify(allData, null, " "), function(err) {
            if (err) throw err
            resolve(true)
          })
        })
      } else {
        console.log('No file path was given for saving the data!')
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
  onEnd: writeFile
}
