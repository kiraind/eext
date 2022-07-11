import fs from 'fs/promises'
import path from 'path'

import stripTrailingSlash from './util/stripTrailingSlash'

export default async function resolveFile (srcPath: string, pathname: string): Promise<string | null> {
  const originalFilename = stripTrailingSlash(path.join(srcPath, pathname))

  for (const attempt of [
    originalFilename,
    originalFilename + '.ejs',
    originalFilename + '.html',
    originalFilename + '.htm',
    originalFilename + '/index.ejs',
    originalFilename + '/index.html',
    originalFilename + '/index.htm'
  ]) {
    try {
      if ((await fs.stat(attempt)).isFile()) {
        return attempt
      }
    } catch (e) {}
  }

  return null
}
