import { parseDocument } from 'htmlparser2'
import { render } from 'dom-serializer'
import { appendChild, getElementsByTagName } from 'domutils'

import { options } from './config'

import wsListener from './templates/wsListener'

export default function prepareHtml (html: string): string {
  if (
    options.hot !== true
  ) {
    return html
  }

  const document = parseDocument(html)

  const [body] = getElementsByTagName('body', document)

  if (options.hot === true) {
    appendChild(body, wsListener)
  }

  return render(document, { selfClosingTags: true })
}
