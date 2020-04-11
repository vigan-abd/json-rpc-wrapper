'use strict'

const http = require('http')
const { RpcWrapper } = require('../index')

// config
const PORT = parseInt(process.env.PORT || '7080')
const HOST = process.env.HOST || '127.0.0.1'

// service that will be proxied
const myService = {
  add: (...params) => params.reduce((acc, curr) => acc + curr, 0),
  subtract: ({ minuend, subtrahend }) => {
    const res = minuend - subtrahend
    if (Number.isNaN(res)) throw new Error('ERR_NAN')
    return res
  }
}

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
