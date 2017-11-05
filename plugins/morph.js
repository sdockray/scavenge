var sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data.sqlite')

function morph (data, options) {
  return new Promise((resolve, reject) => {
    const columns = options.columns.reduce((p, v, i, s) => `${p}${v} TEXT${i < s.length - 1 ? ', ' : ''}`, '')
    try {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS data (${columns})`)
        const toInsert = options.columns.map(key => data[key])
        var statement = db.prepare(`INSERT INTO data (${options.columns.join(',')}) VALUES (${Array(options.columns.length).fill('?')})`)
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

module.exports = morph
