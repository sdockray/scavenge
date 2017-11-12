const proxyquire = require('proxyquire')
const test = require('tape')
const sinon = require('sinon')

function requireMock () {
  const serialize = sinon.stub().callsFake(cb => cb())
  const run = sinon.stub().callsFake((arg, cb) => cb && cb())
  const finalize = sinon.stub().callsFake(cb => cb())
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
  t.comment('start')
  mock.morph.onStart(input, options)
    .then((result, options) => {
      t.ok(spys.db.calledWith('data.sqlite'))
      t.ok(spys.serialize.calledOnce)
      t.comment('it creates a table with options.columns')
      t.ok(spys.run.calledOnce)
      t.same(spys.run.firstCall.args[0], `CREATE TABLE IF NOT EXISTS data (a TEXT, b TEXT, c TEXT)`)
      t.ok(input === result)
      t.end()
    }).catch(t.error)
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
    t.ok(spys.db.calledWith('data.sqlite'))
    t.ok(spys.serialize.calledOnce)
    t.ok(spys.run.calledTwice)
    t.same(spys.run.firstCall.args[0], `DROP TABLE IF EXISTS data`)
    t.same(spys.run.secondCall.args[0], `CREATE TABLE IF NOT EXISTS data (a TEXT)`)
    t.ok(input === result)
    t.end()
  })
  .catch(t.error)
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
