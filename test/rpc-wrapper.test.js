'use strict'

const { expect } = require('chai')
  .use(require('chai-as-promised'))
  .use(require('dirty-chai'))
const dns = require('dns')

const { RpcError } = require('../src/rpc-error')
const { RpcServiceBase } = require('../src/rpc-service-base')
const { RpcWrapper } = require('../src/rpc-wrapper')

module.exports = () => {
  describe('# rpc-wrapper-tests', () => {
    class ProductService extends RpcServiceBase {
      constructor (products = []) {
        super()

        this.methods.push('create', 'remove', 'find', 'rejectedMethod')
        this.products = products
      }

      async create (item) {
        await Promise.resolve()
        this.products.push(item)
      }

      remove (id) {
        this.products = this.products.filter(p => p.id !== id)
      }

      async find (id) {
        await Promise.resolve()
        return this.products.find(p => p.id === id)
      }

      async areParamsValid (method, params) {
        switch (method) {
          case 'rejectedMethod': return true
          case 'create':
            if (typeof params !== 'object') return false
            if (!Object.keys(params).every(key => ['id', 'name'].includes(key))) return false
            if (!params.id || typeof params.id !== 'number') return false
            if (!params.name || typeof params.name !== 'string') return false
            return true
          case 'find':
          case 'remove':
            return params[0] && typeof params[0] === 'number'
          default: return false
        }
      }

      async rejectedMethod () {
        return Promise.reject(new Error('rejected promises err'))
      }
    }

    it('constructor - it should throw if service is not provided', () => {
      expect(() => new RpcWrapper()).to.throw('ERR_SERVICE_REQUIRED')
    })

    it('constructor - it should throw if service is not an object', () => {
      expect(() => new RpcWrapper('aa')).to.throw('ERR_SERVICE_NOT_OBJECT')
      expect(() => new RpcWrapper(() => { })).to.throw('ERR_SERVICE_NOT_OBJECT')
      expect(() => new RpcWrapper(true)).to.throw('ERR_SERVICE_NOT_OBJECT')
    })

    it('constructor - it should store instance as service if it\'s instance of rpc service base', () => {
      const rpcProxy = new RpcWrapper(new RpcServiceBase())
      expect(rpcProxy.service).to.be.instanceOf(RpcServiceBase)
      expect(rpcProxy.proxy).to.be.undefined()
    })

    it('constructor - it should store instance as prox if it isn\'s instance of rpc service base', () => {
      const obj = { foo: () => { } }
      const rpcProxy = new RpcWrapper(obj)
      expect(rpcProxy.service).to.be.undefined()
      expect(rpcProxy.proxy).to.be.equal(obj)
    })

    it('constructor - it should accept also arrays that include methods as item', () => {
      const obj = [() => { }]
      const rpcProxy = new RpcWrapper(obj)
      expect(rpcProxy.service).to.be.undefined()
      expect(rpcProxy.proxy).to.be.equal(obj)
    })

    it('callReq - it should return error in case of invalid json', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = await rpcProxy.callReq('test')

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.null()
      expect(res.result).to.be.undefined()
      expect(res.error).to.be.instanceof(RpcError)
      expect(Object.keys(res.error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
      expect(res.error.code).to.be.equal(RpcError.PARSE_ERROR)
      expect(res.error.message).to.be.equal('Parse error')
      expect(res.error.data).to.be.undefined()
    })

    it('callReq - it should return result in case of id param', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'echo', params: ['a', 2, 3] })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(1)
      expect(res.result).to.be.equal('a')
      expect(res.error).to.be.undefined()
    })

    it('callReq - params may be omited in case if there\'s no required param', async () => {
      const rpcProxy = new RpcWrapper({ echo: () => 'test' })
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'echo', params: [] },
        { jsonrpc: '2.0', id: 2, method: 'echo' }
      ])
      const res = await rpcProxy.callReq(req)

      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(2)

      expect(res[0].jsonrpc).to.be.equal('2.0')
      expect(res[0].id).to.be.equal(1)
      expect(res[0].result).to.be.equal('test')
      expect(res[0].error).to.be.undefined()

      expect(res[1].jsonrpc).to.be.equal('2.0')
      expect(res[1].id).to.be.equal(2)
      expect(res[1].result).to.be.equal('test')
      expect(res[1].error).to.be.undefined()
    })

    it('callReq - on stringify it should have correct format', async () => {
      const rpcProxy = new RpcWrapper({ echo: (...arg) => arg })

      const req = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'echo', params: ['a', 2, 3] })
      let res = await rpcProxy.callReq(req)
      expect(JSON.stringify(res)).to.be.equal('{"jsonrpc":"2.0","result":["a",2,3],"id":1}')

      res = await rpcProxy.callReq('req')
      expect(JSON.stringify(res)).to.be.equal(
        `{"jsonrpc":"2.0","error":{"code":${RpcError.PARSE_ERROR},"message":"Parse error"},"id":null}`
      )
    })

    it('callReq - it should return void in case when no id param is specified', async () => {
      const rpcProxy = new RpcWrapper({ echo: (...arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', method: 'echo', params: ['a', 2, 3] })
      const res = await rpcProxy.callReq(req)
      expect(res).to.be.undefined()
    })

    it('callReq - it should return error in case of invalid request even when no id param is specified', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', params: ['a', 2, 3] })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.null()
      expect(res.result).to.be.undefined()
      expect(res.error).to.be.instanceof(RpcError)
      expect(Object.keys(res.error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
      expect(res.error.code).to.be.equal(RpcError.INVALID_REQUEST)
      expect(res.error.message).to.be.equal('Invalid request')
      expect(res.error.data).to.be.undefined()
    })

    it('callReq - it should return multiple results in case of batch request', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'echo', params: ['a', 2, 3] },
        { jsonrpc: '2.0', id: 2, method: 'echo', params: [55] },
        { jsonrpc: '2.0', id: 3, method: 'echo', params: [] }
      ])
      const results = await rpcProxy.callReq(req)

      expect(results).to.be.an('array')
      expect(results.length).to.be.equal(3)
      results.forEach((res, i) => {
        expect(res.jsonrpc).to.be.equal('2.0')
        expect(res.id).to.be.equal(i + 1)
        expect(res.error).to.be.undefined()
      })
      expect(results[0].result).to.be.equal('a')
      expect(results[1].result).to.be.equal(55)
      expect(results[2].result).to.be.null()
    })

    it('callReq - it should return filter void results in case of batch request', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'echo', params: ['a', 2, 3] },
        { jsonrpc: '2.0', id: 2, method: 'echo', params: [] },
        { jsonrpc: '2.0', method: 'echo', params: [55] }
      ])
      const results = await rpcProxy.callReq(req)

      expect(results).to.be.an('array')
      expect(results.length).to.be.equal(2)
      results.forEach((res, i) => {
        expect(res.jsonrpc).to.be.equal('2.0')
        expect(res.id).to.be.equal(i + 1)
        expect(res.error).to.be.undefined()
      })
      expect(results[0].result).to.be.equal('a')
      expect(results[1].result).to.be.null()
    })

    it('callReq - it should not filter invalid request errors even in case when no id was specified in case of batch request', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'echo', params: ['a', 2, 3] },
        { jsonrpc: '2.0', id: 2, method: 'echo' },
        { jsonrpc: '2.0' }
      ])
      const results = await rpcProxy.callReq(req)

      expect(results).to.be.an('array')
      expect(results.length).to.be.equal(3)
      results.slice(0, 2).forEach((res, i) => {
        expect(res.jsonrpc).to.be.equal('2.0')
        expect(res.id).to.be.equal(i + 1)
        expect(res.error).to.be.undefined()
      })
      expect(results[0].result).to.be.equal('a')
      expect(results[1].result).to.be.null()

      expect(results[2].jsonrpc).to.be.equal('2.0')
      expect(results[2].id).to.be.null()
      expect(results[2].result).to.be.undefined()
      expect(results[2].error).to.be.instanceof(RpcError)
      expect(Object.keys(results[2].error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
      expect(results[2].error.code).to.be.equal(RpcError.INVALID_REQUEST)
      expect(results[2].error.message).to.be.equal('Invalid request')
      expect(results[2].error.data).to.be.undefined()
    })

    it('_procReq - it should return error non object req type', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify([1, 2, 3])
      const results = await rpcProxy.callReq(req)

      expect(results).to.be.an('array')
      expect(results.length).to.be.equal(3)
      results.forEach((res, i) => {
        expect(res.jsonrpc).to.be.equal('2.0')
        expect(res.id).to.be.null()
        expect(res.result).to.be.undefined()
        expect(res.error).to.be.instanceof(RpcError)
        expect(Object.keys(res.error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
        expect(res.error.code).to.be.equal(RpcError.INVALID_REQUEST)
        expect(res.error.message).to.be.equal('Invalid request')
        expect(res.error.data).to.be.undefined()
      })
    })

    it('_procReq - it should return error on non string,number,nil request id', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', id: true, method: 'echo', params: ['a', 2, 3] })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.null()
      expect(res.result).to.be.undefined()
      expect(res.error).to.be.instanceof(RpcError)
      expect(Object.keys(res.error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
      expect(res.error.code).to.be.equal(RpcError.INVALID_REQUEST)
      expect(res.error.message).to.be.equal('Invalid request')
      expect(res.error.data).to.be.undefined()
      expect(JSON.stringify(res)).to.be.equal('{"jsonrpc":"2.0","error":{"code":-32600,"message":"Invalid request"},"id":null}')
    })

    it('_procReq - it should return error on non object,array,nil request params', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', id: '3', method: 'echo', params: 3 })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal('3')
      expect(res.result).to.be.undefined()
      expect(res.error).to.be.instanceof(RpcError)
      expect(Object.keys(res.error).every(key => ['code', 'message', 'data'].includes(key))).to.be.true()
      expect(res.error.code).to.be.equal(RpcError.INVALID_REQUEST)
      expect(res.error.message).to.be.equal('Invalid request')
      expect(res.error.data).to.be.undefined()
      expect(JSON.stringify(res)).to.be.equal('{"jsonrpc":"2.0","error":{"code":-32600,"message":"Invalid request"},"id":"3"}')
    })

    it('_procReq - it should accept nil params', async () => {
      const rpcProxy = new RpcWrapper({ echo: () => 'echo' })
      const req = JSON.stringify({ jsonrpc: '2.0', id: '3', method: 'echo' })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal('3')
      expect(res.result).to.be.equal('echo')
      expect(res.error).to.be.undefined(RpcError)
      expect(JSON.stringify(res)).to.be.equal('{"jsonrpc":"2.0","result":"echo","id":"3"}')
    })

    it('_procReq - it shouldn\'t return response when id is not present', async () => {
      const rpcProxy = new RpcWrapper({ echo: () => 'echo' })
      const req = JSON.stringify({ jsonrpc: '2.0', method: 'echo' })
      const res = await rpcProxy.callReq(req)
      expect(res).to.be.undefined()
    })

    it('_procReq - it should validate allowed method and validate args in case of base service', async () => {
      const myService = new ProductService([
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ])
      const rpcProxy = new RpcWrapper(myService)
      const req = JSON.stringify([
        { jsonrpc: '2.0', method: 'create', params: { id: 4, name: 'Product 4' }, id: '1' },
        { jsonrpc: '2.0', method: 'remove', params: [2], id: '2' },
        { jsonrpc: '2.0', method: 'find', params: [1], id: '3' },
        { jsonrpc: '2.0', method: 'create', params: { id: 5, name: 'Product 4' } },
        { jsonrpc: '2.0', method: 'find', params: ['abc'], id: 4 },
        { jsonrpc: '2.0', method: 'clear', params: ['abc'], id: 5 }
      ])
      const res = await rpcProxy.callReq(req)
      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(5)
      expect(res.every(r => r.jsonrpc === '2.0')).to.be.true()

      expect(res[0].id).to.be.equal('1')
      expect(res[0].error).to.be.undefined()
      expect(res[0].result).to.be.null()

      expect(res[1].id).to.be.equal('2')
      expect(res[1].error).to.be.undefined()
      expect(res[1].result).to.be.null()

      expect(res[2].id).to.be.equal('3')
      expect(res[2].error).to.be.undefined()
      expect(res[2].result).to.be.eql({ id: 1, name: 'Product 1' })

      expect(res[3].id).to.be.equal(4)
      expect(res[3].error).to.be.instanceof(RpcError)
      expect(res[3].error.code).to.be.equal(RpcError.INVALID_PARAMS)
      expect(res[3].error.message).to.be.equal('Invalid params')
      expect(res[3].error.data).to.be.undefined()
      expect(res[3].result).to.be.undefined()

      expect(res[4].id).to.be.equal(5)
      expect(res[4].error).to.be.instanceof(RpcError)
      expect(res[4].error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res[4].error.message).to.be.equal('Method not found')
      expect(res[4].error.data).to.be.undefined()
      expect(res[4].result).to.be.undefined()
    })

    it('_procReq - it should validate property type in case of proxy service', async () => {
      const myService = {
        add: (...params) => params.reduce((acc, curr) => acc + curr, 0),
        subtract: ({ minuend, subtrahend }) => {
          const res = minuend - subtrahend
          if (Number.isNaN(res)) throw new Error('ERR_NAN')
          return res
        },
        count: 33
      }
      const rpcProxy = new RpcWrapper(myService)

      const req = JSON.stringify([
        { jsonrpc: '2.0', method: 'add', params: [1, 2, 3, 4], id: '1' }, // 10
        { jsonrpc: '2.0', method: 'subtract', params: { minuend: 42, subtrahend: 23 }, id: 2 }, // 19
        { jsonrpc: '2.0', method: 'add', params: [1] }, // No response
        { jsonrpc: '2.0', method: 'inexistent', params: [1, 2, 4], id: '3' }, // 'Method not found'
        { jsonrpc: '2.0', method: 'subtract', params: [42, 23] }, // No response although failed
        { jsonrpc: '2.0', method: 'count', id: 4 },
        { jsonrpc: '2.0', method: 'areParamsValid', id: 5 } // invalid response although method exists
      ])
      const res = await rpcProxy.callReq(req)
      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(5)
      expect(res.every(r => r.jsonrpc === '2.0')).to.be.true()

      expect(res[0].id).to.be.equal('1')
      expect(res[0].error).to.be.undefined()
      expect(res[0].result).to.be.equal(10)

      expect(res[1].id).to.be.equal(2)
      expect(res[1].error).to.be.undefined()
      expect(res[1].result).to.be.equal(19)

      expect(res[2].id).to.be.equal('3')
      expect(res[2].error).to.be.instanceof(RpcError)
      expect(res[2].error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res[2].error.message).to.be.equal('Method not found')
      expect(res[2].error.data).to.be.undefined()
      expect(res[2].result).to.be.undefined()

      expect(res[3].id).to.be.equal(4)
      expect(res[3].error).to.be.instanceof(RpcError)
      expect(res[3].error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res[3].error.message).to.be.equal('Method not found')
      expect(res[3].error.data).to.be.undefined()
      expect(res[3].result).to.be.undefined()

      expect(res[4].id).to.be.equal(5)
      expect(res[4].error).to.be.instanceof(RpcError)
      expect(res[4].error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res[4].error.message).to.be.equal('Method not found')
      expect(res[4].error.data).to.be.undefined()
      expect(res[4].result).to.be.undefined()
    })

    it('_procReq - it should support normal functions on execution of method', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const req = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'echo', params: ['my param'] })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(1)
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.equal('my param')
    })

    it('_procReq - it should support promises on execution of method', async () => {
      const rpcProxy = new RpcWrapper({
        echo: async (arg) => {
          await Promise.resolve()
          return arg
        }
      })
      const req = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'echo', params: ['my param'] })
      const res = await rpcProxy.callReq(req)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(1)
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.equal('my param')
    })

    it('_procReq - it should support callback functions on execution of method', async () => {
      const myService = {
        lookup: (hostname, cb) => dns.lookup(hostname, (err, address, family) => cb(err, { family, address })), // custom cb: (err, address, family)
        resolve: (hostname, cb) => { cb(null, '127.0.0.1') } // (err, res) cb
      }

      const rpcProxy = new RpcWrapper(myService, ['lookup', 'resolve'])
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'lookup', params: ['localhost'] },
        { jsonrpc: '2.0', id: 2, method: 'resolve', params: ['google.com'] }
      ])
      const res = await rpcProxy.callReq(req)

      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(2)
      expect(res.every(r => r.jsonrpc === '2.0')).to.be.true()

      expect(res[0].id).to.be.equal(1)
      expect(res[0].error).to.be.undefined()
      expect(res[0].result).to.be.eql({ address: '127.0.0.1', family: 4 })

      expect(res[1].id).to.be.equal(2)
      expect(res[1].error).to.be.undefined()
      expect(res[1].result).to.be.equal('127.0.0.1')
    })

    it('_procReq - it should handle thrown errors during execution of the method', async () => {
      const clsService = new ProductService([
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ])
      const objService = {
        subtract: ({ minuend, subtrahend }) => {
          const res = minuend - subtrahend
          if (Number.isNaN(res)) throw new Error('not a number')
          return res
        },
        promiseErr: async () => { throw new Error('promise error') },
        cbError: (cb) => { cb(new Error('cb error')) }
      }

      let rpcProxy = new RpcWrapper(clsService)
      let req = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'rejectedMethod' })

      let res = await rpcProxy.callReq(req)
      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(1)
      expect(res.error).to.be.instanceof(RpcError)
      expect(res.error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(res.error.message).to.be.equal('Server error')
      expect(res.error.data).to.be.equal('Error: rejected promises err')

      rpcProxy = new RpcWrapper(objService, ['cbError'])
      req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'subtract', params: [10, 3] },
        { jsonrpc: '2.0', id: 2, method: 'promiseErr', params: [] },
        { jsonrpc: '2.0', id: 3, method: 'cbError' }
      ])

      res = await rpcProxy.callReq(req)
      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(3)
      expect(res.every(r => r.jsonrpc === '2.0')).to.be.true()

      expect(res[0].id).to.be.equal(1)
      expect(res[0].error).to.be.instanceof(RpcError)
      expect(res[0].error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(res[0].error.message).to.be.equal('Server error')
      expect(res[0].error.data).to.be.equal('Error: not a number')

      expect(res[1].id).to.be.equal(2)
      expect(res[1].error).to.be.instanceof(RpcError)
      expect(res[1].error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(res[1].error.message).to.be.equal('Server error')
      expect(res[1].error.data).to.be.equal('Error: promise error')

      expect(res[2].id).to.be.equal(3)
      expect(res[2].error).to.be.instanceof(RpcError)
      expect(res[2].error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(res[2].error.message).to.be.equal('Server error')
      expect(res[2].error.data).to.be.equal('Error: cb error')
    })

    it('_procReq - it should return original exception as data when it\'s available', async () => {
      const rpcProxy = new RpcWrapper({
        subtract: ({ minuend, subtrahend }) => {
          const res = minuend - subtrahend
          if (Number.isNaN(res)) throw new Error('not a number')
          return res
        }
      })
      const req = JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'subtract', params: [10, 3] }
      ])

      const res = await rpcProxy.callReq(req)
      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(1)
      expect(res.every(r => r.jsonrpc === '2.0')).to.be.true()

      expect(res[0].id).to.be.equal(1)
      expect(res[0].error).to.be.instanceof(RpcError)
      expect(res[0].error.code).to.be.equal(RpcError.SERVER_ERROR)
      expect(res[0].error.message).to.be.equal('Server error')
      expect(res[0].error.data).to.be.equal('Error: not a number')
    })

    it('_procReq - it should avoid returning response when id param is missing', async () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      let req = JSON.stringify({ jsonrpc: '2.0', method: 'echo', params: ['my param'] })
      let res = await rpcProxy.callReq(req)

      expect(res).to.be.undefined()

      req = JSON.stringify([{ jsonrpc: '2.0', method: 'echo', params: ['my param'] }])
      res = await rpcProxy.callReq(req)

      expect(res).to.be.undefined()

      req = JSON.stringify([
        { jsonrpc: '2.0', method: 'echo', params: ['my param'] },
        { jsonrpc: '2.0', id: 2, method: 'echo', params: ['param2'] }
      ])
      res = await rpcProxy.callReq(req)

      expect(res).to.be.an('array')
      expect(res.length).to.be.equal(1)
      expect(res[0].jsonrpc).to.be.equal('2.0')
      expect(res[0].id).to.be.equal(2)
      expect(res[0].error).to.be.undefined()
      expect(res[0].result).to.be.equal('param2')
    })

    it('_createRes - it should return correct format', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      let res = rpcProxy._createRes(2, null, 33)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(2)
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.equal(33)

      res = rpcProxy._createRes(2, RpcError.createError(RpcError.METHOD_NOT_FOUND, null, 44))
      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(2)
      expect(res.error).to.be.instanceof(RpcError)
      expect(res.error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res.error.message).to.be.equal('Method not found')
      expect(res.error.data).to.be.equal(44)
      expect(res.result).to.be.undefined()
    })

    it('_createRes - it should add error field when it\'s present and skip result even if present', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = rpcProxy._createRes(2, RpcError.createError(RpcError.METHOD_NOT_FOUND, null, 44), 555)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(2)
      expect(res.error).to.be.instanceof(RpcError)
      expect(res.error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res.error.message).to.be.equal('Method not found')
      expect(res.error.data).to.be.equal(44)
      expect(res.result).to.be.undefined()
    })

    it('_createRes - it should add result field when it\'s present and error is not present', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = rpcProxy._createRes(2, null, 33)

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(2)
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.equal(33)
    })

    it('_createRes - it should add result as null when neither error or result is present', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = rpcProxy._createRes('sfsfsfsf')

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal('sfsfsfsf')
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.null()
    })

    it('_createRes - it should use null as id when it\'s not present', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      let res = rpcProxy._createRes()

      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.equal(null)
      expect(res.error).to.be.undefined()
      expect(res.result).to.be.null()

      res = rpcProxy._createRes(null, RpcError.createError(RpcError.METHOD_NOT_FOUND))
      expect(res.jsonrpc).to.be.equal('2.0')
      expect(res.id).to.be.null()
      expect(res.error).to.be.instanceof(RpcError)
      expect(res.error.code).to.be.equal(RpcError.METHOD_NOT_FOUND)
      expect(res.error.message).to.be.equal('Method not found')
      expect(res.error.data).to.be.undefined()
      expect(res.result).to.be.undefined()
    })

    it('_execFunc - it should pass arguments one by one is params is an array', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = rpcProxy._execFunc(rpcProxy.proxy.echo, [1, 2, 3])
      expect(res).to.be.equal(1)
    })

    it('_execFunc - it should pass arguments as one arg when params is an object', () => {
      const rpcProxy = new RpcWrapper({ echo: (arg) => arg })
      const res = rpcProxy._execFunc(rpcProxy.proxy.echo, { a: 1, b: 2 })
      expect(res).to.be.eql({ a: 1, b: 2 })
    })
  })
}
