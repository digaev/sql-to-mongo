const monk = require('monk')
const sqlParser = require('sql-parser')
const util = require('util')

// Used to remove backticks
const strip = (s) => s.slice(1, -1)

class SqlToMongoTranslator {
  constructor (config) {
    this.config = Object.assign({}, config)
    this.mongodb = monk(config.mongodb.url)
  }

  query (sql) {
    this._parseSql(sql)

    const collection = this.mongodb.get(this._tableOptions.collection) // use associated collection
    const query = this._buildSelectQuery()
    const fields = this._getSelectedFields()

    console.log('Fields: ' + util.inspect(fields))
    console.log('Conditions: ' + util.inspect(query, false, null))

    return collection.find(query, fields)
  }

  _parseSql (sql) {
    const tokens = sqlParser.lexer.tokenize(sql)
    this._statement = sqlParser.parser.parse(tokens)
    this._tableName = strip(this._statement.source.toString())
    this._tableOptions = this.config.tables[this._tableName]

    if (!this._tableOptions) {
      throw new Error(`Unknown table "${this._tableName}".`)
    }
  }

  _getAssociatedField (sqlField) {
    const key = this._tableOptions.fields[sqlField]
    if (!key) {
      throw new Error(`Can not find associated field "${sqlField}"`)
    }
    return key
  }

  _getSelectedFields () {
    const fields = {}
    this._statement.fields.forEach((f) => {
      if (f.field) {
        const key = this._getAssociatedField(strip(f.toString()))
        fields[key] = 1
      }
    })
    return fields
  }

  _buildSelectQuery () {
    const query = {}

    if (this._statement.where) {
      let op = this._statement.where.conditions
      let lastOp = '$and'

      while (op.operation) {
        const andOr = ['and', 'or'].includes(op.operation.toLowerCase())
        const right = andOr ? op.right : op
        const key = this._getAssociatedField(strip(right.left.toString()))
        const value = Array.isArray(right.right.value) ? right.right.value.map((v) => v.value) : right.right.value
        const conds = {}

        if (!key) {
          throw new Error(`Can not find associated field "${right.left.value}"`)
        }

        if (andOr) {
          lastOp = `$${op.operation.toLowerCase()}`
        }

        switch (right.operation.toLowerCase()) {
          case '=':
            conds[key] = value
            break
          case '!=':
          case '<>':
            conds[key] = { $ne: value }
            break
          case '>':
            conds[key] = { $gt: value }
            break
          case '>=':
            conds[key] = { $gte: value }
            break
          case '<':
            conds[key] = { $lt: value }
            break
          case '<=':
            conds[key] = { $lte: value }
            break
          case 'in':
            conds[key] = { $in: value }
            break
          default:
            throw new Error(`Undefined operation "${right.operation}"`)
        }

        (query[lastOp] || (query[lastOp] = [])).push(conds)
        op = op.left
      }
    }

    return query
  }
}

module.exports = SqlToMongoTranslator
