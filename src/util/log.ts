export default function log (...args: any[]): void {
  const dateStr = (new Date()).toString().split('(')[0].trim() + ' |'

  console.log(dateStr, ...args)
}
