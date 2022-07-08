import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { URL } from 'url'
import fs from 'fs/promises'
import mime from 'mime-types'
import ejs from 'ejs'

import ejsLint from './ejsLint'
import escapeHtml from './util/escapeHtml'
import resolveFile from './resolveFile'
import resolveDataFor from './resolveDataFor'

export default async function handleGet (srcPath: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.url === undefined) {
    return
  }

  const { pathname } = new URL(request.url, 'http://localhost')

  const filename = await resolveFile(srcPath, pathname)

  if (filename === null) {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.write('404 Not Found\n')
    response.end()
    return
  }

  const ext = path.extname(filename)

  if (ext === '.ejs') {
    const file = await fs.readFile(filename, 'utf-8')

    const data = await resolveDataFor(filename)

    const renderOpts = { filename, async: true, root: srcPath }

    try {
      const html = await ejs.render(file, data, renderOpts)

      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.write(html)
      response.end()
      return
    } catch (err: any) {
      const esjLintErr = await ejsLint(filename, { ...renderOpts, await: true })

      const [errorTitle, errorText] = err instanceof SyntaxError && esjLintErr !== undefined
        ? ['EJS Syntax error', esjLintErr.annotated]
        : ['EJS Error', err.toString()]

      console.error(esjLintErr)
      console.error(err)

      response.writeHead(500, { 'Content-Type': 'text/html' })
      response.write(`
        <body>
          <div style="margin: 100px auto; max-width: 900px">
            <h2 style="color: red">${errorTitle}</h2>
            <pre>${escapeHtml(errorText)}</pre>
          </div>
        </body>
      `)
      response.end()
      return
    }
  }

  const file = await fs.readFile(filename)

  const ct = mime.contentType(ext)

  response.writeHead(200, { 'Content-Type': ct !== false ? ct : 'application/octet-stream' })
  response.write(file, 'binary')
  response.end()
}
