'use strict'

const fs = require('fs')
const http = require('http')
const { RpcWrapper } = require('../index')

class CbService {
  constructor () { this.fields = [1, 2, 3] }

  getFields (cb) { cb(null, this.fields) }
}

// config
const PORT = parseInt(process.env.PORT || '7079')
const HOST = process.env.HOST || '127.0.0.1'

// service that will be proxied
const service1 = {
  storeContent: (content, cb) => {
    fs.writeFile('test.log', content + '\n', { flag: 'a' }, cb)
  }
}
const service2 = new CbService()

const proxy1 = new RpcWrapper(service1, ['storeContent'])
const proxy2 = new RpcWrapper(service2, ['getFields'])

const server = http.createServer((req, res) => {
  // e.g. allow POST only in server
  if (req.method.toUpperCase() !== 'POST') {
    res.writeHead(405, 'Method Not Allowed')
    return res.end()
  }

  const reqUrl = req.url.replace(/\/$/, '')
  if (!['/rpc1', '/rpc2'].includes(reqUrl)) {
    res.writeHead(403, 'Forbidden')
    return res.end()
  }

  const chunks = []
  req.on('data', (data) => {
    chunks.push(data.toString('utf-8'))
  })

  req.on('end', async () => {
    const payload = chunks.join('')
    let rpcRes = null
    if (reqUrl === '/rpc1') {
      rpcRes = await proxy1.callReq(payload)
    } else {
      rpcRes = await proxy2.callReq(payload)
    }

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
  http://localhost:7079/rpc1 \
  -H 'Content-Type: application/json' \
  -d '{ "jsonrpc": "2.0", "method": "storeContent", "params": ["testing file write"], "id": "1" }' | jq '.'

Response example:
{ "jsonrpc": "2.0", "id": "1", "result": null }

Request example:
curl -X POST \
  http://localhost:7079/rpc2 \
  -H 'Content-Type: application/json' \
  -d '{ "jsonrpc": "2.0", "method": "getFields", "id": "1" }' | jq '.'

Response example:
{ "jsonrpc": "2.0", "id": "1", "result": [1,2,3] }
 */
