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
```javascript
const http = require('http')
const { RpcWrapper } = require('../index')

// service that will be proxied
const myService = {
  add: (...params) => params.reduce((acc, curr) => acc + curr, 0),
  subtract: ({ minuend, subtrahend }) => {
    const res = minuend - subtrahend
    if (Number.isNaN(res)) throw new Error('ERR_NAN')
    return res
  },
  div: (a, b) => a /b
}

const rpcProxy = new RpcWrapper(myService)

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
  console.log('HTTP server is listening for requests')
})

```

## Authors
- vigan-abd (vigan.abd@gmail.com)
