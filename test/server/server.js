const http = require('http')
const URL = require('url')
const qs = require('querystring')

const host = 'localhost'
const port = 1337
const paths = {}

const server = http.createServer(function (req, res) {
  const url = URL.parse(req.url, true)
  const uri = decodeURIComponent(url.pathname)
  let postData = ''

  if (paths[uri] !== undefined) {
    if (req.method === 'POST') {
      req.on('data', function (chunk) {
        postData += chunk.toString()
      })
      req.on('end', function () {
        if (!req.headers['content-type'] || req.headers['content-type'].indexOf('multipart') !== 0) {
          postData = qs.parse(postData)
        }
        paths[uri](url, req, res, postData)
      })
    } else {
      paths[uri](url, req, res)
    }
  } else {
    res.writeHead(404)
    res.end()
  }
})

server.on('error', function (error) {
  console.log('ERROR:', error)
})

server.listen(port)

module.exports = function (path, cb) {
  if (paths[path]) {
    throw new Error(`Path ${path} exists`)
  }
  paths[path] = cb
}

module.exports.host = host
module.exports.port = port
module.exports.close = () => server.close()
