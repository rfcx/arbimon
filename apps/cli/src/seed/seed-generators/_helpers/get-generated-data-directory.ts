import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const pathToSeederData = '../data/generated'

export const getGeneratedDataDirectory = (): string => resolve(currentDir, pathToSeederData)
