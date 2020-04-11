'use strict'

const { expect } = require('chai')
  .use(require('dirty-chai'))

const utils = require('../src/utils')

module.exports = () => {
  describe('# utils-tests', () => {
    it('getObjectFunction - it should return only class methods excluding built in obj prototype methods', () => {
      const obj = new class Test {
        constructor () {
          this.test = '333'
          this.foo = this.hello.bind(this)
          this.subCls = { a: '33', bar: () => { } }
        }

        hello () { }
        world () { }
      }()

      expect(utils.getObjectFunctions(obj)).to.be.eql([
        'foo', 'hello', 'toLocaleString', 'toString', 'valueOf', 'world'
      ])
    })

    it('getObjectFunction - it should return only props that are methods', () => {
      const obj = {
        hello: () => { },
        world: () => { },
        test: '333',
        bar: { add: (a, b) => a + b },
        foo: new Promise((resolve) => resolve(true))
      }

      expect(utils.getObjectFunctions(obj)).to.be.eql([
        'hello', 'toLocaleString', 'toString', 'valueOf', 'world'
      ])
    })

    it('getObjectFunction - it should work with array since it\'s an object', () => {
      expect(utils.getObjectFunctions([]).length).to.be.greaterThan(0)
    })

    it('isNil - it should return true only when value is null or undefined', () => {
      let c
      expect(utils.isNil()).to.be.true()
      expect(utils.isNil(null)).to.be.true()
      expect(utils.isNil(undefined)).to.be.true()
      expect(utils.isNil(c)).to.be.true()
      expect(utils.isNil(c || null)).to.be.true()
    })

    it('isNil - it should return false when a value exists', () => {
      let c
      expect(utils.isNil('')).to.be.false()
      expect(utils.isNil(0)).to.be.false()
      expect(utils.isNil(false)).to.be.false()
      expect(utils.isNil({ c })).to.be.false()
    })

    it('isStringOrNumber - it should return true only when value is string or number', () => {
      expect(utils.isStringOrNumber('')).to.be.true()
      expect(utils.isStringOrNumber(0)).to.be.true()
      expect(utils.isStringOrNumber('test')).to.be.true()
      expect(utils.isStringOrNumber(123)).to.be.true()
      expect(utils.isStringOrNumber(17.35)).to.be.true()
    })

    it('isStringOrNumber - it should return false when value is not string and number', () => {
      expect(utils.isStringOrNumber(true)).to.be.false()
      expect(utils.isStringOrNumber()).to.be.false()
      expect(utils.isStringOrNumber()).to.be.false()
      expect(utils.isStringOrNumber({ c: 33 })).to.be.false()
    })

    it('isStringOrNumber - it should return false when value is NaN or infinity', () => {
      expect(utils.isStringOrNumber(NaN)).to.be.false()
      expect(utils.isStringOrNumber(Infinity)).to.be.false()
    })
  })
}
