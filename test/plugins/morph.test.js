const proxyquire = require('proxyquire')
const test = require('tape')
const sinon = require('sinon')

function requireMock () {
  const serialize = sinon.stub()
  const run = sinon.stub()
  const finalize = sinon.stub()
  const prepareRun = sinon.stub()
  const prepare = sinon.stub().callsFake(() => ({
    run: prepareRun,
    finalize
  }))
  const db = sinon.stub().callsFake(() => ({
    serialize,
    run,
    prepare
  }))
  const mock = {
    sqlite3: {
      verbose: () => ({ Database: db })
    }
  }
  return {
    morph: proxyquire('../../plugins/morph', mock),
    spys: {
      serialize,
      run,
      finalize,
      prepareRun,
      prepare,
      db,
      mock
    }
  }
}

test('morph.onStart() returns object passed to it', (t) => {
  const mock = requireMock()
  var input = { foo: 'bar' }
  mock.morph.onStart(input)
  .then((result) => {
    t.ok(input === result)
    t.end()
  })
})

test('morph.onStart() returns promise which eventually returns the object passed to it', (t) => {
  const mock = requireMock()
  var input = { foo: 'bar' }
  mock.morph.onStart(input)
  .then((result) => {
    t.ok(input === result)
    t.end()
  })
})

test('morph.onEnd() returns object passed to it', (t) => {
  const morph = require('../../plugins/morph')
  var input = { foo: 'bar' }
  var returned = morph.onEnd(input)
  t.ok(returned === input)
  t.end()
})
