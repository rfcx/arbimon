import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))

const pathToMockData = '../../../../../packages/common/src/mock-data'
export const getMockDataDirectory = (): string =>
  resolve(currentDir, pathToMockData)

const pathToJsonOutput = '../../../out'
export const getJsonOutputDirectory = (): string =>
  resolve(currentDir, pathToJsonOutput)

const pathToSeederData = '../../../src/db/seeders/_data'
export const getSeederDataDirectory = (): string =>
  resolve(currentDir, pathToSeederData)
