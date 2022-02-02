import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const pathToMockData = '../../../../../packages/common/src/mock-data'
const pathToJsonOutput = '../../../out'

export const getMockDataDirectory = (): string =>
  resolve(currentDir, pathToMockData)

export const getJsonOutputDirectory = (): string =>
  resolve(currentDir, pathToJsonOutput)
