import fs from 'fs/promises'

export default async function resolveDataFor (ejsFilename: string): Promise<Record<string, any> | undefined> {
  const jsonFilename = ejsFilename.replace(/.ejs$/, '.json')

  try {
    const json = await fs.readFile(jsonFilename, 'utf-8')

    const data = JSON.parse(json)

    if (data !== null && typeof data === 'object' && !(data instanceof Array)) {
      return data
    }
  } catch (e) {}

  return undefined
}
