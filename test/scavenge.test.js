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
  const instructions = {
    origin: testDomain + '/find',
    find: 'img',
    variables: {
      'img': '@src'
    },
    actions: {
      'test-plugin': {
        foo: 'bar',
        baz: 123,
        yes: true
      }
    }
  }

  const scavenge = proxyquire('../lib/scavenge', {
    'test-plugin': {
      '@noCallThru': true,
      onStart: pluginStartFn,
      onData: pluginDataFn,
      onEnd: (data, options) => {
        t.ok(pluginStartFn.calledOnce, 'a plugin’s onStart() is only called once')
        t.ok(pluginStartFn.calledWith(instructions, options), 'a plugin’s onStart() is called with instructions and plugin options ')
        t.same(pluginDataFn.callCount, 3, 'a plugin’s onData() is called for each data')
        const calls = pluginDataFn.getCalls()
        t.ok(calls.every(call => call.args[0].img !== undefined && call.args[1] === options), 'each onData() is called with a data object and the plugins options')
        t.same(options, {
          foo: 'bar',
          baz: 123,
          yes: true
        }, 'a plugin’s onEnd() receives the plugin options as as second arg')
        t.end()
        return data
      }
    }
  })
  scavenge.go(instructions)
})

test.onFinish(() => {
  server.close()
})
