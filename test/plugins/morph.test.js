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

test('morph.onStart() - returns promise which eventually returns the object passed to it', (t) => {
  const mock = requireMock()
  const spys = mock.spys
  const input = { foo: 'bar' }
  const options = { columns: ['a', 'b', 'c'] }
  mock.morph.onStart(input, options)
  .then((result, options) => {
    t.ok(spys.db.calledWith('data.sqlite3'))
    t.ok(spys.serialize.calledOnce)
    t.comment('it creates a table with options.columns')
    t.ok(spys.run.calledOnce)
    t.ok(spys.run.calledWith(`CREATE TABLE IF NOT EXISTS data (a TEXT, b TEXT, c TEXT)`))
    t.ok(input === result)
    t.end()
  })
})

test('morph.onStart() - options.refresh = true will drop the table and recreate it ', (t) => {
  const mock = requireMock()
  const spys = mock.spys
  const input = { foo: 'bar' }
  const options = {
    refesh: true,
    columns: ['a']
  }
  mock.morph.onStart(input, options)
  .then((result, options) => {
    t.ok(spys.db.calledWith('data.sqlite3'))
    t.ok(spys.run.calledTwice)
    t.ok(spys.serialize.calledOnce)
    t.ok(spys.run.calledTwice)
    const calls = spys.run.calls()
    t.ok(calls[0].args(`DROP TABLE IF EXISTS data`))
    t.ok(calls[1].args(`CREATE TABLE IF NOT EXISTS data (a TEXT)`))
    t.ok(input === result)
    t.end()
  })
})

test('morph.onData() - returns promise, and returns the data passed to it unmodified', (t) => {
  const mock = requireMock()
  const input = { foo: 'bar' }
  const options = { }
  mock.morph.onData(input, options)
  .then((result) => {
    t.ok(input === result)
    t.end()
  })
})

test('morph.onEnd() returns object passed to it', (t) => {
  const morph = require('../../plugins/morph')
  const input = { foo: 'bar' }
  const returned = morph.onEnd(input)
  t.ok(returned === input)
  t.end()
})
