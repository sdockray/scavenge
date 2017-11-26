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

test('translate.onData() - it replaces data[key] using regex in options[key].replace with string specified in options[key].with', (t) => {
  const options = {
    raw: {
      replace: 'viewIssue',
      with: 'download'
    }
  }
  const input = {
    raw: 'https://www.performancephilosophy.org/journal/issue/viewIssue/4/4'
  }
  const expectedOutput = { raw: 'https://www.performancephilosophy.org/journal/issue/download/4/4' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test.only('translate.onData() - replace option replaces all instances of matching regex', (t) => {
  const options = {
    raw: {
      replace: '\\w+',
      with: 'a'
    }
  }
  const input = {
    raw: 'https://www.performancephilosophy.org/journal/issue/viewIssue/4/4'
  }
  const expectedOutput = { raw: 'a://a.a.a/a/a/a/a/a' }
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

test('translate.onData() - options[key] accepts an array of options which are each applied in order', (t) => {
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

test('translate.onData() - options[key].transform transforms the data[key] and its matches (if present)', (t) => {
  const cases = [
    {
      transform: 'sentence',
      input: 'along the Journey of Our LIFE half way,',
      result: 'Along the journey of our life half way,'
    },
    {
      transform: 'title',
      input: 'At the midpoint in the journey of our life',
      result: 'At the midpoint in the journey of our life'
    },
    {
      transform: 'heading',
      input: 'HALF over the wayfaring of our life,',
      result: 'HALF Over The Wayfaring Of Our Life'
    },
    {
      transform: 'lower',
      input: 'HalfWayAlongThe RoadWe Have to Go,',
      result: 'half way along the road we have to go'
    },
    {
      transform: 'upper',
      input: 'Halfway-along-the_journey_of_our_life',
      result: 'HALFWAY ALONG THE JOURNEY OF OUR LIFE'
    },
    {
      transform: 'lowerFirst',
      input: 'HALFWAY on our life’s journey, in a wood',
      result: 'hALFWAY on our life’s journey, in a wood'
    },
    {
      transform: 'upperFirst',
      input: 'Halfway through our trek in life',
      result: 'Halfway through our trek in life'
    },
    {
      transform: 'camel',
      input: 'Half-way upon the journey of our life,',
      result: 'halfWayUponTheJourneyOfOurLife'
    },
    {
      transform: 'kebab',
      input: 'HALF-WAY upon the journey of our life',
      result: 'half-way-upon-the-journey-of-our-life'
    },
    {
      transform: 'snake',
      input: 'In middle of the journey of our days',
      result: 'in_middle_of_the_journey_of_our_days'
    },
    {
      transform: 'deburr',
      input: 'déjà vu',
      result: 'deja vu'
    },
    {
      transform: 'toLower',
      input: 'In midWay oF THE journey of our life',
      result: 'in midway of the journey of our life'
    },
    {
      transform: 'toUpper',
      input: 'In our life’s journey at its midway stage',
      result: 'IN OUR LIFE’S JOURNEY AT ITS MIDWAY STAGE'
    },
    {
      transform: 'parseInt',
      input: '100.0',
      result: 100
    }
  ]
  for (var i = 0; i < cases.length; i++) {
    const c = cases[i]
    t.comment('transform ' + i + ':' + c.transform)
    const options = {
      x: {
        default: c.input,
        match: '.+',
        to: {
          y: '$0'
        },
        transform: c.transform
      },
      a: {
        transform: c.transform
      }
    }
    const input = { x: c.input, a: c.input }
    const expectedOutput = { x: c.result, y: c.result, a: c.result }
    const output = translate.onData(input, options)
    t.same(output, expectedOutput)
  }
  t.end()
})

test('translate.onData() - options[key].transform can be an array, transforms will be applied in order', (t) => {
  const options = {
    a: {
      transform: ['lower', 'kebab', 'upperFirst']
    }
  }
  const input = { a: 'FESTINA LENTE' }
  const expectedOutput = { a: 'Festina-lente' }
  const output = translate.onData(input, options)
  t.same(output, expectedOutput)
  t.end()
})

test('translate.onEnd() returns object passed to it', (t) => {
  var input = { foo: 'bar' }
  var returned = translate.onEnd(input)
  t.ok(returned === input)
  t.end()
})
