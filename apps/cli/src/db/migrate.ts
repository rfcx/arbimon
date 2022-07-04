import { execMigrations } from '@/db/actions/exec-migrations'
import { updateMasterData } from './_helpers/update-master-data'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  await execMigrations(sequelize, verbose)
  await updateMasterData(sequelize)
  await sequelize.close()
}

await main()
