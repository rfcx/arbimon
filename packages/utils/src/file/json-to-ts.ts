const LINE_BREAK = '\n'

export const objectToTs = (data: any, constName: string, type?: string, ...importLines: string[]): string =>
  jsonToTs(JSON.stringify(data, undefined, 2), constName, type, ...importLines)

export const jsonToTs = (data: string, constName: string, type?: string, ...importLines: string[]): string => {
  const imports = importLines.length > 0 ? `${importLines.join(LINE_BREAK)}${LINE_BREAK}${LINE_BREAK}` : ''
  const declaration = `export const ${constName}${type ? ': ' + type : ''} = `
  const object = data
    .replace(/'/gm, "\\'") // escape single quotes
    .replace(/^(\s*)"(\w*)":/gm, '$1$2:') // remove quotes around keys
    .replace(/(:\s*)"(.*)"(,)?$/gm, '$1\'$2\'$3') // convert double quotes to single around values
    .replace(/\\"/gm, '"') // unescape double quotes

  return `${imports}${declaration}${object}${LINE_BREAK}`
}
