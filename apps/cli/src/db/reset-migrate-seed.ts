import { execSeeders } from '@/db/actions/exec-seeders'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { dropTables, execMigrations } from './actions'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  // Setup
  const sequelize1 = getSequelize(verbose)
  const sequelize2 = getSequelize(verbose) // Seeders uses a different Umzug (which seems to require a fresh Sequelize instance)

  // Reset, migrate, seed, refresh mviews
  await dropTables(sequelize1)
  await execMigrations(sequelize1, verbose)
  await execSeeders(sequelize2, '01-master-data', verbose)
  await execSeeders(sequelize2, '02-integration-test-data', verbose)
  await execSeeders(sequelize2, '03-external-data-mock', verbose)
  await execSeeders(sequelize2, '05-user-data-mock', verbose)
  await refreshMviews(sequelize2)

  // Teardown
  await sequelize1.close()
  await sequelize2.close()
}

await main()
