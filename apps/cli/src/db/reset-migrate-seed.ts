import { execSeeders } from '@/db/actions/exec-seeders'
import { dropTables, execMigrations } from './actions'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  await dropTables(sequelize)
  await execMigrations(sequelize, verbose)
  await execSeeders(sequelize, 'auto', verbose)
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
