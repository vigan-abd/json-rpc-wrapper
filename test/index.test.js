'use strict'

const rpcError = require('./rpc-error.test')
const rpcServiceBase = require('./rpc-service-base.test')
const rpcWrapper = require('./rpc-wrapper.test')
const utils = require('./utils.test')

describe('*** Unit testing! ***', () => {
  rpcError()
  rpcServiceBase()
  rpcWrapper()
  utils()
})
