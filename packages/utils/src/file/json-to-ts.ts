const LINE_BREAK = '\n'

export const objectToTs = (data: any, constName: string, type?: string, ...importLines: string[]): string =>
  jsonToTs(JSON.stringify(data, undefined, 2), constName, type, ...importLines)

export const jsonToTs = (data: string, constName: string, type?: string, ...importLines: string[]): string => {
  const imports = importLines.length > 0 ? `${importLines.join(LINE_BREAK)}${LINE_BREAK}${LINE_BREAK}` : ''
  const declaration = `export const ${constName}${type ? ': ' + type : ''} = `
  const object = data
    .replace(/'/gm, "\\'")
    .replace(/^(\s*)"(\w*)":/gm, '$1$2:')
    .replace(/(:\s*)"([^"]*)"/gm, '$1\'$2\'')

  return `${imports}${declaration}${object}${LINE_BREAK}`
}
