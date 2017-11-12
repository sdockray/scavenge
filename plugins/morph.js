var sqlite3 = require('sqlite3').verbose()

/*
  Config options
  file: name of db - defaults to data.sqlite
  refresh: bool - if true drops table if it already exists
  table: name of table - defaults to data
  columns: list of variable names to include as columns in the table
 */

let db

function start (instructions, options) {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database(options.name || 'data.sqlite')
      db.serialize(() => {
        const table = options.table || 'data'
        if (options.refresh) {
          db.run(`DROP TABLE IF EXISTS ${table}`)
        }
        const columns = options.columns.join(' TEXT, ')
        db.run(`CREATE TABLE IF NOT EXISTS ${table} (${columns} TEXT)`, () => {
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
  const table = options.table || 'data'
  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        const columns = options.columns
        const placeholders = Array(columns.length).fill('?').join(',')
        const toInsert = columns.map(key => data[key])
        var statement = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`)
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
