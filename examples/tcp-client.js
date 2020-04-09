'use strict'

const net = require('net')

const PORT = parseInt(process.env.PORT || '7070')
const HOST = process.argv[3] || '127.0.0.1'

const cmd = [
  { jsonrpc: '2.0', method: 'echo', params: [[1, 2, 4]], id: '1' }, // [1,2,4]
  { jsonrpc: '2.0', method: 'ping', id: '2' }, // e.g. 1586392547104
  { jsonrpc: '2.0', method: 'echo', params: [1, 2, 4], id: '3' }, // 1
  { jsonrpc: '2.0', method: 'echo', params: [1, 2, 4] }, // no response
  { jsonrpc: '2.0', method: 'inexistent', params: [1, 2, 4], id: '4' }, // 'Method not found'
  { jsonrpc: '2.0', id: 5 } // 'Invalid request'
]

const client = new net.Socket()

client.connect(PORT, HOST, () => {
  const req = JSON.stringify(cmd)
  client.write(req, (err) => {
    if (err) console.log(err)
  })
})

let chunks = []

client.on('data', (data) => {
  chunks.push(data.toString('utf-8'))
})

client.on('end', () => {
  const data = chunks.join('')
  console.log('data from server:')
  console.log(JSON.parse(data))
})

client.on('close', () => {
  console.log('socket closed')
  chunks = []
})

client.on('error', (err) => {
  console.error(err)
})
