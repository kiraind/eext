import fs from 'fs/promises'
import path from 'path'

import stripTrailingSlash from './util/stripTrailingSlash'

export default async function resolveFile (srcPath: string, pathname: string): Promise<string | null> {
  const originalFilename = stripTrailingSlash(path.join(srcPath, pathname))
  const filenameEjs = originalFilename + '.ejs'
  const filenameIndexEjs = originalFilename + '/index.ejs'

  for (const attempt of [originalFilename, filenameEjs, filenameIndexEjs]) {
    try {
      if ((await fs.stat(attempt)).isFile()) {
        return attempt
      }
    } catch (e) {}
  }

  return null
}
