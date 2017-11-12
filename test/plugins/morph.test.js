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
    name: 'custom_name.sql',
    refresh: true,
    columns: ['a']
  }

  mock.morph.onStart(input, options)
  .then((result, options) => {
    t.ok(spys.db.calledWith('custom_name.sql'))
    t.ok(spys.serialize.calledOnce)
    t.ok(spys.run.calledTwice)
    t.same(spys.run.firstCall.args[0], `DROP TABLE IF EXISTS data`)
    t.same(spys.run.secondCall.args[0], `CREATE TABLE IF NOT EXISTS data (a TEXT)`)
    t.ok(input === result)
    t.end()
  })
  .catch(t.error)
})

test('morph.onData() - inserts variables from data that are specified in options.columns', (t) => {
  const mock = requireMock()
  const spys = mock.spys
  const input = { a: 'this', b: 'or', c: 'that', d: 'and' }
  const options = { columns: ['a', 'd', 'c'] }
  mock.morph.onStart({}, options)
    .then(() => mock.morph.onData(input, options))
    .then((result) => {
      t.ok(spys.serialize.calledTwice)
      t.ok(spys.prepare.calledOnce)
      t.same(spys.prepare.firstCall.args[0], `INSERT INTO data (a,d,c) VALUES (?,?,?)`)
      t.ok(input === result)
      t.end()
    })
})

test('morph.onData() - do nothing if there is an error', (t) => {
  const mock = requireMock()
  const input = { a: 'this', b: 'or', c: 'that', d: 'and' }
  const options = { columns: ['a', 'd', 'c'] }
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
