var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var utils = require('../utils')
var tpl = utils.tpl

// This is a super-simple plugin for creating a directory

/*
  directory: specify a directory name
 */


function mkdir (data, config) {
  return new Promise((resolve, reject) => {
    try {
      if (config.directory) {
        var dir = (config.directory) ? tpl(config.directory, data) : undefined
        if (dir) {
          mkdirp(dir)
        }
      }
      resolve(data)
    } catch (e) {
      resolve(data)
    }
  })
}

module.exports = {
  onStart: a => a,
  onData: mkdir,
  onEnd: a => a
}
