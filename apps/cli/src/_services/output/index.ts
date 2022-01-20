import { dirname, resolve } from 'path'

const currentDir = dirname(new URL(import.meta.url).pathname)
const pathToMockData = '../../../../../packages/common/src/mock-data'
const pathToJsonOutput = '../../../out'

export const getMockDataDirectory = (): string =>
  resolve(currentDir, pathToMockData)

export const getJsonOutputDirectory = (): string =>
  resolve(currentDir, pathToJsonOutput)
