export const jsonToTs = (data: string, constName: string): string =>
  'export const ' +
  constName +
  ' = ' +
  data.replaceAll('": "', '\': \'')
    .replaceAll('  "', '  \'')
    .replaceAll('",', '\',')
