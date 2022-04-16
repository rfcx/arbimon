import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const pathToRoot = '../../../../' // remember this starts in /lib/...
const pathFromRootToSeederData = 'src/seed/data/generated'

export const getGeneratedDataDirectory = (): string => resolve(currentDir, pathToRoot, pathFromRootToSeederData)
