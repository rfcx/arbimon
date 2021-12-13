export const objectToTs = (data: any, constName: string): string =>
  jsonToTs(JSON.stringify(data, undefined, 2), constName)

export const jsonToTs = (data: string, constName: string): string =>
  'export const ' +
  constName +
  ' = ' +
  data.replaceAll('": "', '\': \'')
    .replaceAll('  "', '  \'')
    .replaceAll('",', '\',')
