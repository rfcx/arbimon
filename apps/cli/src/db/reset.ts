import { dropTables } from './actions/drop-tables'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  await dropTables(sequelize)
  await sequelize.close()
}

await main()
