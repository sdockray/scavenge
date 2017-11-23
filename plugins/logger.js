
const log = (message) => (input, options) => {
  console.log('--> ', message, '----------->')
  console.log(JSON.stringify(input, null, 2))
  return input
}

module.exports = {
  onStart: log('onStart'),
  onData: log('onData'),
  onEnd: log('onEnd')
}
