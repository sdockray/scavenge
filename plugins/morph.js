var sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data.sqlite')

function start (instructions, options) {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        db.run('DROP TABLE IF EXISTS data')
        const columns = options.columns.join(' TEXT, ')
        console.log('columns', columns)
        db.run(`CREATE TABLE IF NOT EXISTS data (${columns} TEXT)`, () => {
          resolve(instructions)
        })
      })
    } catch (e) {
      console.log('!!!!!!', e)
      resolve(instructions)
    }
  })
}

function saveData (data, options) {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        const columns = options.columns
        const placeholders = Array(columns.length).fill('?').join(',')
        const toInsert = columns.map(key => data[key])
        var statement = db.prepare(`INSERT INTO data (${columns.join(',')}) VALUES (${placeholders})`)
        statement.run(...toInsert)
        statement.finalize(() => {
          resolve(data)
        })
      })
    } catch (e) {
      console.log('!!!!!!', e)
      resolve(data)
    }
  })
}

module.exports = {
  onStart: start,
  onData: saveData,
  onEnd: a => a
}
