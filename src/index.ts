#!/usr/bin/env node

import http from 'http'

import { options, srcPath } from './config'

import log from './util/log'
import handleGet from './handleGet'
import addHotReloads from './hotReloads'

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    handleGet(req, res).catch(err => {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end()
      console.error(err)
    }).finally(() => {
      log(`${req.method ?? '???'} ${req.url ?? '???'} -> ${res.statusCode}`)
    })
  } else if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    })
    res.end()
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    res.write('Method Not Allowed\n')
    res.end()
  }
})

if (options.hot === true) {
  addHotReloads(server, srcPath)
}

server.listen(options.port, () => {
  log(`Static file server running at\n  => http://localhost:${options.port as number}/\nCTRL + C to shutdown`)
})
