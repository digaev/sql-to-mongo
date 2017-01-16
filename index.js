const fs = require('fs')
const SqlToMongoTranslator = require('./translator')

const sql = "SELECT * FROM svista.balans WHERE card_no='8600000000000001'"
const config = JSON.parse(fs.readFileSync('./translator.config.json'))
const translator = new SqlToMongoTranslator(config)

translator.query(sql).then((docs) => {
  console.log(docs)
}).catch((err) => {
  console.log(err)
})

// const args = process.argv.slice(2)
// if (args.length === 0) {
//   console.log('Usage: node . "SQL QUERY"')
//   console.log('Example: node . "SELECT * FROM table"')
//   process.exit()
// } else {
//   // const sql = "SELECT * FROM svista.balans WHERE card_no IN('8600482914550428', '8600000000000001')"
//   const sql = args.join(' ')
//   const config = JSON.parse(fs.readFileSync('./translator.config.json'))
//   const translator = new SqlToMongoTranslator(config)

//   translator.query(sql).then(function (err, result) {
//     console.log(err)
//     console.log(result)
//   });
// }
