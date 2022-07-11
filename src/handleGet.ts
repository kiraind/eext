import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { URL } from 'url'
import fs from 'fs/promises'
import mime from 'mime-types'
import ejs from 'ejs'

import { srcPath } from './config'

import ejsLint from './ejsLint'
import escapeHtml from './util/escapeHtml'
import resolveFile from './resolveFile'
import resolveDataFor from './resolveDataFor'
import prepareHtml from './prepareHtml'

export default async function handleGet (request: IncomingMessage, response: ServerResponse): Promise<void> {
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

  if (ext === '.ejs' || ext === '.html' || ext === '.htm') {
    const renderOpts = { filename, async: true, root: srcPath }

    try {
      let markup = await fs.readFile(filename, 'utf-8')

      if (ext === '.ejs') {
        const data = await resolveDataFor(filename)

        markup = await ejs.render(markup, data, renderOpts)
      }

      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.write(
        prepareHtml(markup)
      )
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
      response.write(prepareHtml(`
        <body>
          <div style="margin: 100px auto; max-width: 900px">
            <h2 style="color: red">${errorTitle}</h2>
            <pre>${escapeHtml(errorText)}</pre>
          </div>
        </body>
      `))
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
