import { execMigrations } from './_helpers'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  await execMigrations(sequelize, verbose)
  await sequelize.close()
}

await main()
