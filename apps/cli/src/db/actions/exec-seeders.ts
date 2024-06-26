import { dirname, resolve } from 'path'
import { type Sequelize } from 'sequelize'
import { fileURLToPath } from 'url'

import { TABLE_SEQUELIZE_SEEDERS } from '@/db/connections/table-names'
import { getUmzug } from '../connections'

const currentDir = dirname(fileURLToPath(import.meta.url))

export const execSeeders = async (sequelize: Sequelize, seederPath: string, verbose = false): Promise<void> => {
  // Extract CWD & filename
  const fullPath = resolve(currentDir, '../seeders', seederPath)
  const isSingleSeed = fullPath.endsWith('.ts') || fullPath.endsWith('.js')
  const filename = isSingleSeed ? fullPath.slice(0, fullPath.length - 3).split('/').pop() : undefined
  const cwd = isSingleSeed ? fullPath.slice(0, fullPath.lastIndexOf('/')) : fullPath

  // Init umzug
  const umzug = getUmzug(sequelize, verbose, TABLE_SEQUELIZE_SEEDERS, cwd, filename)

  // Run seeders
  const previouslyExecuted = await umzug.executed().then(previousSeeders => previousSeeders.length)
  await umzug.up().then(newSeeders => {
    console.info(`Executed ${newSeeders.length} needed seeders in ${seederPath} (${previouslyExecuted} previously executed)`)
    newSeeders.forEach(r => { console.info(`- ${r.name}`) })
  })
}
