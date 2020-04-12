'use strict'

const { expect } = require('chai')
  .use(require('dirty-chai'))

const { RpcError } = require('../src/rpc-error')

module.exports = () => {
  describe('# rpc-error-tests', () => {
    it('constructor - it should store args in right order', () => {
      const error = new RpcError(RpcError.PARSE_ERROR, 'test', { foo: 'bar' })
      expect(error).to.be.instanceof(Error)
      expect(error).to.be.instanceof(RpcError)
      expect(error.code).to.be.equal(RpcError.PARSE_ERROR)
      expect(error.message).to.be.equal('test')
      expect(error.data).to.be.eql({ foo: 'bar' })
    })

    it('constructor - it should allow only valid codes', () => {
      const error = new RpcError(1234, 'test', { foo: 'bar' })
      expect(error).to.be.instanceof(Error)
      expect(error).to.be.instanceof(RpcError)
      expect(error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(error.message).to.be.equal('test')
      expect(error.data).to.be.eql({ foo: 'bar' })
    })

    it('toJSON - it should return only jsonrpc 2.0 fields', () => {
      const error = new RpcError(RpcError.METHOD_NOT_FOUND, 'test', { foo: 'bar' })
      const json = error.toJSON()
      expect(
        Object.keys(json).every(key => ['code', 'message', 'data'].includes(key))
      ).to.be.true()
      expect(json.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(json.message).to.be.equal('test')
      expect(json.data).to.be.eql({ foo: 'bar' })
    })

    it('toJSON - it shouldn\'t include data in case when it doesn\'t exist', () => {
      const error = new RpcError(RpcError.INVALID_PARAMS, 'test')
      const json = error.toJSON()
      expect(
        Object.keys(json).every(key => ['code', 'message', 'data'].includes(key))
      ).to.be.true()
      expect(json.code).to.be.equal(RpcError.INVALID_PARAMS)
      expect(json.message).to.be.equal('test')
      expect(json.data).to.be.undefined()
    })

    it('JSON.stringify - it should return json format expected by protocol', () => {
      const error = new RpcError(RpcError.INTERNAL_ERROR, 'test', { foo: 'bar' })
      expect(JSON.stringify(error)).to.be.equal('{"code":-32603,"message":"test","data":{"foo":"bar"}}')
    })

    it('toString - it should return json format expected by protocol', () => {
      const error = new RpcError(123, 'test', { foo: 'bar' })
      expect(error.toString()).to.be.equal(JSON.stringify(error))
    })

    it('createError - it should return RpcError instance', () => {
      const error = RpcError.createError(RpcError.INVALID_REQUEST, 'Testing', 333)
      expect(error).to.be.instanceof(RpcError)
      expect(error.code).to.be.equal(RpcError.INVALID_REQUEST)
      expect(error.message).to.be.equal('Testing')
      expect(error.data).to.be.equal(333)
    })

    it('createError - it should use default values when no data provider', () => {
      const err1 = RpcError.createError(-32098)
      expect(err1.code).to.be.equal(-32098)
      expect(err1.message).to.be.equal('Server error')
      expect(err1.data).to.be.undefined()

      const err2 = RpcError.createError(-32098)
      expect(err2.code).to.be.equal(-32098)
      expect(err2.message).to.be.equal('Server error')
      expect(err2.data).to.be.undefined()
    })
  })
}
