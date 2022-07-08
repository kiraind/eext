export default function stripTrailingSlash (str: string): string {
  if (str.slice(-1) === '/') {
    return str.slice(0, str.length - 1)
  }

  return str
}
