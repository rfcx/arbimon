import * as fs from 'fs'
import { size } from 'lodash-es'

const LINE_BREAK = '\n'

export const objectToTs = (data: any, constName: string, type?: string, ...prefixLines: string[]): string =>
  jsonToTs(JSON.stringify(data, undefined, 2), constName, type, ...prefixLines)

export const jsonToTs = (data: string, constName: string, type?: string, ...prefixLines: string[]): string => {
  const imports = prefixLines.length > 0 ? `${prefixLines.join(LINE_BREAK)}${LINE_BREAK}${LINE_BREAK}` : ''
  const declaration = `export const ${constName}${type ? ': ' + type : ''} = `
  const object = data
    .replace(/'/gm, "\\'") // escape single quotes
    .replace(/^(\s*)"(\w*)":/gm, '$1$2:') // remove quotes around bare keys
    .replace(/^(\s*)"([\w\\.]*)":/gm, '$1\'$2\':') // replace quotes around deep keys
    .replace(/(:\s*)"(.*)"(,)?$/gm, '$1\'$2\'$3') // convert double quotes to single around values
    .replace(/\\"/gm, '"') // unescape double quotes

  return `${imports}${declaration}${object}${LINE_BREAK}`
}

export const objectToTsFile = (filePath: string, data: any, constName: string, type?: string, ...prefixLines: string[]): void => {
  const outputTs = objectToTs(data, constName, type, ...prefixLines)
  fs.writeFileSync(filePath, outputTs, 'utf8')
  console.info(`Wrote ${size(data)} values to ${filePath}`)
}
