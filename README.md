# JSON-RPC Wrapper

[![Build Status](https://travis-ci.org/vigan-abd/json-rpc-wrapper.svg?branch=master)](https://travis-ci.org/vigan-abd/json-rpc-wrapper)
![npm](https://img.shields.io/npm/v/json-rpc-wrapper)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/vigan-abd/json-rpc-wrapper.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/vigan-abd/json-rpc-wrapper/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/vigan-abd/json-rpc-wrapper.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/vigan-abd/json-rpc-wrapper/context:javascript)


This library provides a basic json rpc wrapper for any object class that needs to be exposed to the network. It builds a proxy with method validations and argument processing arround any variable that has methods. The provided library is infrastructure agnostic so it can be used on any possible transport layer.


## Installing
```console
npm install --save json-rpc-wrapper
```

## Testing
```console
npm run test
```

## Usage

Wrapping a simple object through json rpc protocol would be similar to this:
```javascript
const { RpcWrapper } = require('json-rpc-wrapper')
const myService = {
  add: (...params) => params.reduce((acc, curr) => acc + curr, 0),
  subtract: (a, b) =>  a - b,
  div: ({a, b}) => a / b
}

const rpcProxy = new RpcWrapper(myService)

const req = '{"jsonrpc":"2.0","method":"add","params":[1,2,3],"id":"1"}' // data received through some protocol
const res = await rpcProxy.callReq(req) // {jsonrpc:'2.0',id:'1',result:6}
const json = JSON.stringify(res) // or res.toString() -> '{"jsonrpc":"2.0","id":"1","result":6}'
```

The wrapper also supports functions with callbacks, we just have to specify which methods expect callback functions:
```javascript
const service = {
  storeContent: (content, cb) => {
    fs.writeFile('test.log', content + '\n', { flag: 'a' }, (err, res) => {
      if (err) return cb(err)
      return cb(null, true)
    })
  }
}
const rpcProxy = new RpcWrapper(service)

const req = '{"jsonrpc":"2.0","method":"storeContent","params":["some content"],"id":56}'
const res = await rpcProxy.callReq(req) // {jsonrpc:'2.0',id:56,result:true}
```

In additional wrapper also works with promises and async/await functions without an issue:
```javascript
const service = {
  store: async (order) => {
    await storeOrder(order)
    await updateStocks(order.products)
    return true
  }
}
const rpcProxy = new RpcWrapper(service)

const req = '{"jsonrpc":"2.0","method":"storeContent","params":{"user":1,"products":[{"id":1,"name":"p1"},{"id":2,"name":"p2"}]},"id":"xgsdoigh-dsgh-sdgjlsgj"}'
const res = await rpcProxy.callReq(req) // {jsonrpc:'2.0',id:'xgsdoigh-dsgh-sdgjlsgj',result:true}
```

Wrapper works also with any type of class instance without a problem. A special type of class that can be used is `RpcServiceBase` abstract class that provides also method parameter validation during method invocation. Here's a quick example of usage of this class:
```javascript
class ProductService extends RpcServiceBase {
  constructor (products = []) {
    super()

    this.methods.push('create', 'find')
    this.products = products
  }

  create (item) { return this.products.push(item) }
  find (id) { return this.products.find(p => p.id === id) }
  remove (id) { this.products = this.products.filter(p => p.id !== id) }

  async areParamsValid (method, params) {
    switch (method) {
      case 'create':
        if (!params.id || typeof params.id !== 'number') return false
        if (!params.name || typeof params.name !== 'string') return false
        return true
      case 'find':
        return params[0] && typeof params[0] === 'number'
      default: return false
    }
  }
}

const myService = new ProductService([ { id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' } ])
const rpcProxy = new RpcWrapper(myService)

const req = JSON.stringify([
  { "jsonrpc": "2.0", "method": "create", "params": { "id": 4, "name": "Product 4" }, "id": "1" },
  { "jsonrpc": "2.0", "method": "remove", "params": [ 2 ], "id": "2" },
  { "jsonrpc": "2.0", "method": "find", "params": [ 1 ], "id": "3" },
  { "jsonrpc": "2.0", "method": "create", "params": { "id": 5, "name": "Product 4" } },
  { "jsonrpc": "2.0", "method": "find", "params": [ "abc" ], "id": 4 }
])

const rpcRes = await rpcProxy.callReq(req)
// [
//   { "jsonrpc": "2.0", "id": "1", "result": null },
//   { "jsonrpc": "2.0", "id": "2", "result": null },
//   { "jsonrpc": "2.0", "id": "3", "result": { "id": 1, "name": "Product 1" } },
//   { "jsonrpc": "2.0", "id": 4, "error": { "code": -32602, "message": "Invalid params" } }
// ]
```

### Simple TCP JSONRPC 2.0 instance
```javascript
const net = require('net')
const { RpcWrapper } = require('json-rpc-wrapper')

const service = {
  ping: () => Date.now(),
  echo: (params) => params
}
const rpcProxy = new RpcWrapper(service)

const server = net.createServer({ allowHalfOpen: true})

server.on('connection', async (socket) => {
  socket.on('data', (data) => {
    const raw = data.toString('utf-8')
    const res = await rpcProxy.callReq(raw)
    socket.write(JSON.stringify(res), () => socket.end())
  })
})

server.listen(7070, () => {
  console.log(`TCP server is listening on ::7070`)
})

```

### Simple HTTP JSONRPC 2.0 instance
```javascript
const http = require('http')
const { RpcWrapper } = require('json-rpc-wrapper')

const service = {
  ping: () => Date.now(),
  echo: (params) => params
}
const rpcProxy = new RpcWrapper(service)

const server = http.createServer((req, res) => {
  const chunks = []
  req.on('data', (data) => {
    chunks.push(data.toString('utf-8'))
  })

  req.on('end', async () => {
    const payload = chunks.join('')
    const rpcRes = await rpcProxy.callReq(payload)
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify(rpcRes))
    res.end()
  })
})

server.listen(8080, () => {
  console.log(`HTTP server is listening on 8080`)
})

```

Additional detailed examples can be found in [examples folder](./examples).

Also full documentation related classes can be found in [docs/DEFINITIONS.md](./docs/DEFINITIONS.md)

## Authors
- vigan-abd (vigan.abd@gmail.com)
