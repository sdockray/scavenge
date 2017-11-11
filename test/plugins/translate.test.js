const test = require('tape')
const translate = require('../../plugins/translate')

test('translate.onStart() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onStart(input)
  t.ok(returned === input)
  t.end()
})

test('translate.onData() - it translates data[key] using regex in options[key].match and options[key].to specifies new keys to be added to data', (t) => {
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

test('translate.onData() - do nothing if options[key] is not found in data and default is not set', (t) => {
  const options = {
    raw: {
      match: '...',
      to: {
        new: '$0'
      }
    }
  }
  const input = { a: 'b' }
  const expectedOutput = input
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onData() - options[key] accepts an array options which are applied in order', (t) => {
  const options = {
    statement: [{
      match: '(\\d+) \\+ (\\d+)',
      to: {
        a: '$1',
        b: '$2',
        d: '$0'
      }
    },
    {
      match: ' = (\\d+)',
      to: {
        c: '$1',
        d: '$0'
      }
    }]
  }
  const input = {
    statement: '2 + 2 = 5'
  }
  const expectedOutput = { statement: input.statement, a: '2', b: '2', c: '5', d: ' = 5' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onData() - handles input variables being arrays', (t) => {
  const options = {
    statement: [{
      match: '(\\d+) \\+ (\\d+)',
      to: {
        a: '$1',
        b: '$2'
      }
    },
    {
      match: ' = (\\d+)',
      to: {
        c: '$1'
      }
    }]
  }
  const input = {
    statement: ['2 + 2 = 5', '3 + 1 = 4']
  }
  const expectedOutput = { statement: input.statement, a: ['2', '3'], b: ['2', '1'], c: ['5', '4'] }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onData() - it does not effect data variables not included in options', (t) => {
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

test('translate.onData() - options[key].default sets an optional value if the data[key] is undefined', (t) => {
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

test('translate.onData() - options[key].default sets an optional value if match is not found', (t) => {
  const options = {
    x: {
      default: 'property is theft',
      match: '\\d+',
      to: {
        y: '$0'
      }
    }
  }
  const input = { x: 'rent' }
  const expectedOutput = { x: 'rent', y: 'property is theft' }
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
