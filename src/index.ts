#!/usr/bin/env node

import http from 'http'
import commandLineArgs, { OptionDefinition } from 'command-line-args'

import handleGet from './handleGet'
import log from './util/log'
import path from 'path'

const optionDefinitions: OptionDefinition[] = [
  // { name: 'hotreload', alias: 'r', type: Boolean },
  { name: 'src', alias: 's', type: String, defaultValue: '.' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8080 }
]

const options = commandLineArgs(optionDefinitions)

http.createServer((req, res) => {
  if (req.method === 'GET') {
    handleGet(path.join(process.cwd(), options.src), req, res).catch(err => {
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
}).listen(options.port)

log(`Static file server running at\n  => http://localhost:${options.port as number}/\nCTRL + C to shutdown`)
