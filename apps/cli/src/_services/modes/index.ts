const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1].toLowerCase() ?? 'dev'
const MODE_PRODUCTION = 'production'

console.info(`Running species data lookup in ${MODE} mode`)

export const limitUnlessProduction = <T> (input: T[]): T[] =>
  MODE === MODE_PRODUCTION
    ? input
    : input.slice(0, 3)
