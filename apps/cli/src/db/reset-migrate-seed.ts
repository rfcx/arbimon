import { DEFAULT_LOCAL_SEEDER_PATHS } from '../seed'
import { dropTables, execMigrations, execSeeders, refreshMviews, updateMasterData } from './_helpers'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPaths = process.argv
  .find(arg => arg.startsWith('--path='))
  ?.split('=')[1]
  ?.split(',') ?? DEFAULT_LOCAL_SEEDER_PATHS

const main = async (): Promise<void> => {
  try {
    // Reset, migrate
    // TODO - Refactor as `withSequelize`
    const sequelize1 = getSequelize(verbose)
    await dropTables(sequelize1)
    await execMigrations(sequelize1, verbose)
    await updateMasterData(sequelize1)

    // Seed, refresh mviews
    // Seeders uses a different Umzug (which seems to require a fresh Sequelize instance)
    const sequelize2 = getSequelize(verbose)
    for (const path of seederPaths) {
      await execSeeders(sequelize2, path, verbose)
    }
    await refreshMviews(sequelize2)

    // Cleanup
    await sequelize1.close()
    await sequelize2.close()
    console.info('RMS: finished')
  } catch (err: any) {
    console.error(err)
    process.exitCode = 1
  }
}

await main()
