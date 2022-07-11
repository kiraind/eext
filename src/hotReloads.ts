import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import chokidar from 'chokidar'

import randomBase64 from './util/randomBase64'
import log from './util/log'

export default function addHotReloads (server: Server, srcPath: string): void {
  const wss = new WebSocketServer({ server })

  const clients = new Map<string, WebSocket>()

  wss.on('connection', client => {
    const clientId = randomBase64()

    clients.set(clientId, client)

    client.on('close', () => {
      clients.delete(clientId)
    })
  })

  chokidar.watch(srcPath).on('all', (type, path) => {
    log(`Reloading: ${type} at ${path}`)

    clients.forEach(client => client.send(JSON.stringify({
      type: 'hotreload',
      payload: {
        type,
        path
      }
    })))
  })
}
