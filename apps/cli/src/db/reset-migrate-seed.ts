import { execSeeders } from '@/db/actions/exec-seeders'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getOpenSearchClient } from '@/search/opensearch/utilities'
import { updateMasterData } from './_helpers/update-master-data'
import { dropTables, execMigrations, indexOpensearch } from './actions'
import { getSequelize } from './connections'
import { defaultSeederPaths } from './seeders/default-seeders'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPaths = process.argv
  .find(arg => arg.startsWith('--path='))
  ?.split('=')[1] ?? defaultSeederPaths.join(',')

const main = async (): Promise<void> => {
  try {
    // Setup
    const opensearch = getOpenSearchClient()
    const sequelize1 = getSequelize(verbose)
    const sequelize2 = getSequelize(verbose) // Seeders uses a different Umzug (which seems to require a fresh Sequelize instance)

    // Reset, migrate, seed, refresh mviews
    await dropTables(sequelize1)
    await execMigrations(sequelize1, verbose)
    await updateMasterData(sequelize2)
    for (const seederPath of seederPaths.split(',')) {
      await execSeeders(sequelize2, seederPath, verbose)
    }
    await refreshMviews(sequelize2)
    await indexOpensearch(opensearch, sequelize1)

    // Teardown
    await sequelize1.close()
    await sequelize2.close()
    await opensearch.close()
    console.info('RMS: finished')
  } catch (err: any) {
    console.error(err)
    process.exitCode = 1
  }
}

await main()
