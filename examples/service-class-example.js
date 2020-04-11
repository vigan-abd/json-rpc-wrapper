'use strict'

const http = require('http')
const { RpcWrapper, RpcServiceBase } = require('../index')

class ProductService extends RpcServiceBase {
  constructor (products = []) {
    super()

    this.methods.push('create', 'remove', 'find')
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
}

// config
const PORT = parseInt(process.env.PORT || '7078')
const HOST = process.env.HOST || '127.0.0.1'

// service that will be proxied
const myService = new ProductService([
  { id: 1, name: 'Product 1' },
  { id: 2, name: 'Product 2' },
  { id: 3, name: 'Product 3' }
])

const rpcProxy = new RpcWrapper(myService)

const server = http.createServer((req, res) => {
  // e.g. allow POST only in server
  if (req.method.toUpperCase() !== 'POST') {
    res.writeHead(405, 'Method Not Allowed')
    return res.end()
  }
  if (req.url.replace(/\/$/, '') !== '/rpc') {
    res.writeHead(403, 'Forbidden')
    return res.end()
  }

  const chunks = []
  req.on('data', (data) => {
    chunks.push(data.toString('utf-8'))
  })

  req.on('end', async () => {
    const payload = chunks.join('')
    const rpcRes = await rpcProxy.callReq(payload)

    if (!rpcRes || (Array.isArray(rpcRes) && rpcRes.length === 0)) {
      res.writeHead(204, 'No Content')
      res.end()
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify(rpcRes))
    res.end()
  })
})

server.listen(PORT, HOST, () => {
  console.log(`HTTP server is listening on ${HOST}:${PORT}`)
})

/**
Request example:

curl -X POST \
  http://localhost:7078/rpc \
  -H 'Content-Type: application/json' \
  -d '[
  { "jsonrpc": "2.0", "method": "create", "params": { "id": 4, "name": "Product 4" }, "id": "1" },
  { "jsonrpc": "2.0", "method": "remove", "params": [ 2 ], "id": "2" },
  { "jsonrpc": "2.0", "method": "find", "params": [ 1 ], "id": "3" },
  { "jsonrpc": "2.0", "method": "create", "params": { "id": 5, "name": "Product 4" } },
  { "jsonrpc": "2.0", "method": "find", "params": [ "abc" ], "id": 4 }
]' | jq '.'

Response example:
[
  { "jsonrpc": "2.0", "id": "1", "result": null },
  { "jsonrpc": "2.0", "id": "2", "result": null },
  { "jsonrpc": "2.0", "id": "3", "result": { "id": 1, "name": "Product 1" } },
  { "jsonrpc": "2.0", "id": 4, "error": { "code": -32602, "message": "Invalid params" } }
]
 */
