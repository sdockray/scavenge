const test = require('tape')
const translate = require('../../plugins/translate')

test('translate.onStart() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onStart(input)
  t.ok(returned === input)
  t.end()
})

test('translate.onEnd() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onStart(input)
  t.ok(returned === input)
  t.end()
})
