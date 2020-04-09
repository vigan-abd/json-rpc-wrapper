'use strict'

const http = require('http')

// config
const PORT = parseInt(process.env.PORT || '7080')
const HOST = process.env.HOST || '127.0.0.1'

const cmd = [
  { jsonrpc: '2.0', method: 'add', params: [1, 2, 3, 4], id: '1' }, // 10
  { jsonrpc: '2.0', method: 'subtract', params: { minuend: 42, subtrahend: 23 }, id: 2 }, // 19
  { jsonrpc: '2.0', method: 'add', params: [1] }, // No response
  { jsonrpc: '2.0', method: 'inexistent', params: [1, 2, 4], id: '3' }, // 'Method not found'
  { jsonrpc: '2.0', method: 'subtract', params: { minuend: 42 }, id: '4' }, // 'Server error', Error: ERR_NAN
  { jsonrpc: '2.0', method: 'subtract', params: [42, 23] }, // No response although failed
  { jsonrpc: '2.0', id: '4' } // 'Invalid request'
]
const payload = JSON.stringify(cmd)

const options = {
  hostname: HOST,
  port: PORT,
  path: '/rpc',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}

const req = http.request(options, (res) => {
  console.log(res.statusCode, res.statusMessage)

  const chunks = []
  res.on('data', (data) => {
    chunks.push(data.toString('utf-8'))
  })

  res.on('end', async () => {
    const data = chunks.join('')
    console.log('data from server:')
    console.log(JSON.parse(data))
  })
})

req.write(payload, () => req.end())
