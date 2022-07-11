const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_'

export default function randomBase64 (length: number = 16): string {
  let str = ''

  for (let i = 0; i < length; i += 1) {
    str += alphabet[
      Math.floor(
        Math.random() * alphabet.length
      )
    ]
  }

  return str
}
