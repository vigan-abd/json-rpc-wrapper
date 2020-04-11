'use strict'

const { expect } = require('chai')
  .use(require('chai-as-promised'))
  .use(require('dirty-chai'))

const RpcError = require('../src/rpc-error')
const RpcServiceBase = require('../src/rpc-service-base')

module.exports = () => {
  describe('# rpc-service-base-tests', () => {
    class RpcService extends RpcServiceBase {
      constructor () {
        super()
        this.methods.push('validMethod', 'method2')
      }

      areParamsValid (method, params) {
        switch (method) {
          case 'validMethod': return params[0] === 'valid_params'
          default: return false
        }
      }

      validMethod () { } //
    }

    it('constructor - the class can be instanciated', () => {
      const instance = new RpcServiceBase()
      expect(instance).to.be.instanceof(RpcServiceBase)
      expect(instance.methods).to.be.eql([])
    })

    it('base.validateMethod - should be rejected with the appropriate error', async () => {
      expect(
        new RpcServiceBase().validateMethod('test')
      ).to.be.rejectedWith(RpcError)

      try {
        await new RpcServiceBase().validateMethod('test')
      } catch (err) {
        expect(err).to.be.instanceof(RpcError)
        expect(err.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
        expect(err.message).to.be.equal('Method not found')
        expect(err.data).to.be.undefined()
      }
    })

    it('base.validateParams - should be rejected with the appropriate error', async () => {
      expect(
        new RpcServiceBase().validateParams('test', {})
      ).to.be.rejectedWith(Error)

      try {
        await new RpcServiceBase().validateParams('test', {})
      } catch (err) {
        expect(err).to.be.instanceof(Error)
        expect(err).not.to.be.instanceof(RpcError)
        expect(err.message).to.be.equal('ERR_METHOD_NOT_IMPLEMENTED')
      }
    })

    it('base.areParamsValid - should be rejected with the appropriate error', async () => {
      expect(
        new RpcServiceBase().areParamsValid('test', {})
      ).to.be.rejectedWith(Error)

      try {
        await new RpcServiceBase().areParamsValid('test', {})
      } catch (err) {
        expect(err).to.be.instanceof(Error)
        expect(err).not.to.be.instanceof(RpcError)
        expect(err.message).to.be.equal('ERR_METHOD_NOT_IMPLEMENTED')
      }
    })

    it('extended.validateMethod - should be fulfilled in case of valid method', () => {
      return expect(
        new RpcService().validateMethod('validMethod')
      ).to.be.fulfilled()
    })

    it('extended.validateMethod - should be rejected in case of invalid method', async () => {
      expect(
        new RpcService().validateMethod('invalidMethod')
      ).to.be.rejectedWith(RpcError)

      try {
        await new RpcService().validateMethod('invalidMethod')
      } catch (err) {
        expect(err).to.be.instanceof(RpcError)
        expect(err.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
        expect(err.message).to.be.equal('Method not found')
        expect(err.data).to.be.undefined()
      }
    })

    it('extended.validateMethod - should be rejected in case of invalid method type even if it\'s added in methods array', async () => {
      expect(
        new RpcService().validateMethod('method2')
      ).to.be.rejectedWith(RpcError)

      try {
        await new RpcService().validateMethod('method2')
      } catch (err) {
        expect(err).to.be.instanceof(RpcError)
        expect(err.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
        expect(err.message).to.be.equal('Method not found')
        expect(err.data).to.be.undefined()
      }
    })

    it('extended.validateParams - should be fulfilled in case of valid method', () => {
      return expect(
        new RpcService().validateParams('validMethod', ['valid_params'])
      ).to.be.fulfilled()
    })

    it('extended.validateParams - should be rejected in case of invalid method', async () => {
      expect(
        new RpcService().validateParams('validMethod', { invalid_params: true })
      ).to.be.rejectedWith(RpcError)

      try {
        await new RpcService().validateParams({ invalid_params: true })
      } catch (err) {
        expect(err).to.be.instanceof(RpcError)
        expect(err.code).to.be.equal(RpcError.INVALID_PARAMS)
        expect(err.message).to.be.equal('Invalid params')
        expect(err.data).to.be.undefined()
      }
    })

    it('extended.areParamsValid - should return true in case of valid params', async () => {
      const res = await new RpcService().areParamsValid('validMethod', ['valid_params'])
      expect(res).to.be.true()
    })

    it('extended.areParamsValid - should return false in case of invalid params', async () => {
      const res = new RpcService().areParamsValid('validMethod', ['invalid_params'])
      expect(res).to.be.false()
    })

    it('extended.areParamsValid - should return false in case of invalid method', async () => {
      const res = new RpcService().areParamsValid('invalidMethod', ['valid_params'])
      expect(res).to.be.false()
    })
  })
}
