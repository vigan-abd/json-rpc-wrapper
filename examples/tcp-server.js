'use strict'

const net = require('net')
const { RpcWrapper } = require('../index')

// config
const PORT = parseInt(process.env.PORT || '7070')
const HOST = process.env.HOST || '127.0.0.1'

// service that will be proxied
const myService = {
  ping: () => Date.now(),
  echo: (params) => params
}

const rpcProxy = new RpcWrapper(myService)

const server = net.createServer({
  allowHalfOpen: true // manage end ack ourselves
})

server.on('connection', (socket) => {
  socket.on('close', () => {
    console.log('client socket closed')
  })

  socket.on('error', (err) => {
    console.error(err.toString())
  })

  socket.on('data', (data) => {
    const raw = data.toString('utf-8')

    rpcProxy.callReq(raw).then(res => {
      if (!res || (Array.isArray(res) && res.length === 0)) {
        socket.end()
        return
      }
      socket.write(JSON.stringify(res), () => socket.end())
    })
  })
})

// start server
server.listen(PORT, HOST, () => {
  console.log(`TCP server is listening on ${HOST}:${PORT}`)
})
