const test = require('tape')
const { tpl } = require('../lib/utils')

/* eslint-disable no-template-curly-in-string */
test('tpl(string, object) selects replaces all ${x} in the with x from object', (t) => {
  const cases = [{
    arguments: ['nothing to change', { var: 'simple' }],
    output: 'nothing to change'
  }, {
    arguments: ['a ${var} test', { var: 'simple' }],
    output: 'a simple test'
  }, {
    arguments: ['a ${var} test ${var}${var}', { var: 'duplicate' }],
    output: 'a duplicate test duplicateduplicate'
  },
  {
    arguments: ['a ${var} test with ${second}', { var: 'simple', second: 'many' }],
    output: 'a simple test with many'
  }, {
    arguments: ['a ${var} test with ${second}', { var: 'simple', second: 'many' }],
    output: 'a simple test with many'
  }, {
    arguments: ['a ${x.a} test with ${x[b]}', { x: { a: 'simple', b: 'paths' } }],
    output: 'a simple test with paths'
  }, {
    arguments: ['now with a ${dead} path', { x: 'y' }],
    output: 'now with a undefined path'
  }, {
    arguments: ['${dangerous}', { dangerous: 'a/a* ?/:2' }],
    output: 'a/a* ?/:2'
  }]
  cases.forEach(c => t.same(c.output, tpl(...c.arguments)))
  t.end()
})

test('can also sanitizes the variables with ${path|safe}', (t) => {
  t.same('aa 2', tpl('${dangerous|safe}', { dangerous: 'a/a*// ?/:2' }))
  t.end()
})

test('can also escapes the variables with ${path|fs}', (t) => {
  t.same('a\\/filename\\/with\\/slashes', tpl('${dangerous|fs}', { dangerous: 'a/filename/with/slashes' }))
  t.end()
})
