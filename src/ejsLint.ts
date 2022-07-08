/*
  BASED ON:      https://github.com/RyanZim/EJS-Lint/blob/master/index.js
  THEIR LICENSE: https://github.com/RyanZim/EJS-Lint/blob/master/LICENSE
*/

import fs from 'fs/promises'
import path from 'path'
import ejs from 'ejs'
import check from 'syntax-error'
// @ts-expect-error
import EJS_INCLUDE_REGEX from 'ejs-include-regex'

export default async function ejsLint (
  filename: string,
  opts: ejs.Options & {
    delimiter?: string
    preprocessorInclude?: boolean
    await?: boolean
  } = {}
): Promise<SyntaxError & { annotated: string } | undefined> {
  const text = await fs.readFile(filename, 'utf-8').catch(() => null)

  if (text === null) {
    return undefined
  }

  // @ts-expect-error
  const arr: string[] = new ejs.Template(text, opts).parseTemplateText()

  // Initialize mode var
  // This is used to indicate the status:
  // Inside Scriptlet, mode=1 (scriptlet) or mode=2 (expression)
  // Outside Scriptlet, mode=0
  let mode: number
  // Initialize delimiter variable
  const d = opts.delimiter ?? '%'
  const js = arr
    .map((str) => {
      switch (str) {
        case `<${d}`:
        case `<${d}_`:
          mode = 1
          return padWhitespace(str)
        case `<${d}=`:
        case `<${d}-`:
          mode = 2
          return `;${padWhitespace(str)}`
        case `${d}>`:
        case `-${d}>`:
        case `_${d}>`:
          str = padWhitespace(str) + (mode === 2 ? ';' : '')
          mode = 0
          return str
        case (str.match(EJS_INCLUDE_REGEX as RegExp) ?? {}).input:
          // if old-style include
          // - replace with whitespace if preprocessorInclude is set
          // - otherwise, leave it intact so it errors out correctly
          return opts.preprocessorInclude ?? false ? padWhitespace(str) : str
        default:
          // If inside Scriptlet, pass through
          if ((mode ?? 0) !== 0) return str
          // else, pad with whitespace
          return padWhitespace(str)
      }
    })
    .join('')
  const checkOptions = {
    allowAwaitOutsideFunction: opts.await ?? false
  }

  const err = check(js, filename, checkOptions)

  if (err !== undefined) {
    return err
  }

  const includes = js.match(/(?<=include\(['"]).*(?=['"])/g) ?? []

  for (const include of includes) {
    const templateFilename = path.join(path.dirname(filename), include).replace(/.ejs$/, '') + '.ejs'

    const templateError = await ejsLint(templateFilename, opts)

    if (templateError !== undefined) {
      return templateError
    }
  }

  return undefined
}

function padWhitespace (text: string): string {
  let res = ''
  text.split('\n').forEach((line, i) => {
    // Add newline
    if (i !== 0) res += '\n'
    // Pad with whitespace between each newline
    for (let x = 0; x < line.length; x++) res += ' '
  })
  return res
}
