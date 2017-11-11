const test = require('tape')
const translate = require('../../plugins/translate')

test('translate.onStart() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onStart(input)
  t.ok(returned === input)
  t.end()
})

test('translate.onData(input, options) - it translates data[key] using regex in options[key].match and options[key].to specifies new keys to be added to data', (t) => {
  const options = {
    raw: {
      match: '\\n(?:[\\s\\S]*by\\s([\\s\\S]+), )?page (\\d+) \\[\\.pdf file\\]',
      to: {
        author: '$1',
        page: '$2'
      }
    }
  }
  const input = {
    raw: 'Why PLG? Why paper? Why bridge generations?\nby Elaine Harger, page 3 [.pdf file]'
  }
  const expectedOutput = { raw: input.raw, author: 'Elaine Harger', page: '3' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onData(input, options) - it does not effect data variables not included in options', (t) => {
  const options = {
    raw: {
      match: '\\w+',
      to: {
        new: '$0'
      }
    }
  }
  const input = {
    raw: 'this yes',
    new: 'this',
    something: 'not'
  }
  const expectedOutput = { raw: input.raw, something: input.something, new: 'this' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onData(input, options) - options[key].default sets an optional value if the data[key] is undefined', (t) => {
  const options = {
    x: {
      default: 'property is theft'
    }
  }
  const input = {}
  const expectedOutput = { x: 'property is theft' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onEnd() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onStart(input)
  t.ok(returned === input)
  t.end()
})
