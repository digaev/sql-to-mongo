/* eslint-disable no-undef */

const chai = require('chai')
const fs = require('fs')
const SqlToMongoTranslator = require('../translator')

const expect = chai.expect

describe('SqlToMongoTranslator', () => {
  const config = JSON.parse(fs.readFileSync('./translator.config.json'))
  const translator = new SqlToMongoTranslator(config)
  const sql = "SELECT card_no FROM svista.balans WHERE card_no IN('8600482914550428', '8600000000000001')"

  before(() => {
    translator._parseSql(sql)
  })

  describe('#_parseSql()', () => {
    it('should parse sql and set table options', () => {
      expect(translator._statement).to.be.not.null
      expect(translator._tableName).to.eq('svista.balans')
      expect(translator._tableOptions).to.deep.equal(translator.config.tables['svista.balans'])
    })
  })

  describe('#_getSelectedFields()', () => {
    it('should return selected fields', () => {
      const fields = translator._getSelectedFields()
      expect(fields).to.deep.equal({ number: 1 })
    })
  })

  describe('#_buildSelectQuery()', () => {
    it('should return conditions object', () => {
      const query = translator._buildSelectQuery()
      expect(query).to.deep.equal({
        $and: [ { number: { '$in': [ '8600482914550428', '8600000000000001' ] } } ]
      })
    })
  })
})
