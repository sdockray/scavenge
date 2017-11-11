const proxyquire = require('proxyquire')
const sinon = require('sinon')
const test = require('tape')
const server = require('./server/server')

const testDomain = server.host + ':' + server.port

server('/find', function (url, req, res) {
  res.setHeader('Content-Type', 'text/html')
  res.write(`<body>\
    <div class="content">\
        <ul name="test">\
            <li><b>first</b></li>\
        </ul>\
        <ul>\
            <li><b>one</b></li>\
            <li>\
                <b>two</b><b>three <img src="1" />, <img src="2" />, <img src="3" /></b>\
            </li>\
        </ul>\
    </div>\
   </body>`)
  res.end()
})

test('scavenge.go(instructions)', (t) => {
  const pluginStartFn = sinon.stub().callsFake(a => a)
  const pluginDataFn = sinon.stub().callsFake(a => a)

  const scavenge = proxyquire('../lib/scavenge', {
    'test': {
      '@noCallThru': true,
      onStart: pluginStartFn,
      onData: pluginDataFn,
      onEnd: (data, config) => {
        console.log('ended!!!!!')
        t.ok(pluginStartFn.calledOnce)
        t.same(pluginDataFn.callCount, 3)
        t.same(config, {
          foo: 'bar',
          baz: 123,
          yes: true
        })
        t.end()
        return data
      }
    }
  })
  const instructions = {
    origin: testDomain + '/find',
    find: 'img',
    variables: {
      'img': '@src'
    },
    actions: {
      test: {
        foo: 'bar',
        baz: 123,
        yes: true
      }
    }
  }
  scavenge.go(instructions)
})

test.onFinish(() => {
  server.close()
})
