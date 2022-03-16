import { execSeeders } from '@/db/actions/exec-seeders'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { dropTables, execMigrations } from './actions'
import { getSequelize } from './connections'

const DEFAULT_LOCAL_SEEDER_PATHS = [
  '01-master-data',
  '02-integration-test-data',
  '03-external-data-mock',
  '05-user-data-mock'
].join(',')

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPaths = process.argv
  .find(arg => arg.startsWith('--path='))
  ?.split('=')[1] ?? DEFAULT_LOCAL_SEEDER_PATHS

const main = async (): Promise<void> => {
  // Setup
  const sequelize1 = getSequelize(verbose)
  const sequelize2 = getSequelize(verbose) // Seeders uses a different Umzug (which seems to require a fresh Sequelize instance)

  // Reset, migrate, seed, refresh mviews
  await dropTables(sequelize1)
  await execMigrations(sequelize1, verbose)
  for (const seederPath of seederPaths.split(',')) {
    await execSeeders(sequelize2, seederPath, verbose)
  }
  await refreshMviews(sequelize2)

  // Teardown
  await sequelize1.close()
  await sequelize2.close()
}

await main()
