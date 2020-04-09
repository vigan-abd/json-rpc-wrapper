'use strict'

const rpcError = require('./rpc-error.test')
const rpcServiceBase = require('./rpc-service-base.test')
const utils = require('./utils.test')

describe('*** Unit testing! ***', () => {
  rpcError()
  rpcServiceBase()
  utils()
})
