import { execSeeders } from '@/db/actions/exec-seeders'
import { dropTables, execMigrations } from './actions'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize1 = getSequelize(verbose)
  await dropTables(sequelize1)
  await execMigrations(sequelize1, verbose)
  await sequelize1.close()

  const sequelize2 = getSequelize(verbose) // Seeders uses a different Umzug (which seems to require a fresh Sequelize instance)
  await execSeeders(sequelize2, 'auto', verbose)
  await sequelize2.close()
}

await main()
  .catch(e => console.error(e))
