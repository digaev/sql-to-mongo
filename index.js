const fs = require('fs')
const SqlToMongoTranslator = require('./translator')
const util = require('util')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('Usage: node . "SQL QUERY"')
  console.log('Example: node . "SELECT * FROM table"')
  process.exit()
} else {
  const sql = args.join(' ')
  const config = JSON.parse(fs.readFileSync('./translator.config.json'))
  const translator = new SqlToMongoTranslator(config)

  translator.query(sql).then((docs) => {
    console.log('Result: ' + util.inspect(docs, false, null))
    return 0
  }).catch((err) => {
    console.log('An error occured :( ' + err.message)
    return 1
  }).then(process.exit)
}
