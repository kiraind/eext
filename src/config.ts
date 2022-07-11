import path from 'path'
import commandLineArgs, { OptionDefinition } from 'command-line-args'

const optionDefinitions: OptionDefinition[] = [
  { name: 'hot', alias: 'r', type: Boolean, defaultValue: false },
  { name: 'src', alias: 's', type: String, defaultValue: '.' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8080 }
]

export const options = commandLineArgs(optionDefinitions)
export const srcPath = path.join(process.cwd(), options.src)
