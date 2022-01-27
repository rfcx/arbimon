import { QueryTypes } from 'sequelize'

import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)

  // Drop all public tables
  const tables = await sequelize.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'', { type: QueryTypes.SELECT })
  for (const table of tables) {
    console.info(`Drop if exists: public.${table.tablename}`)
    await sequelize.query(`DROP TABLE IF EXISTS public.${table.tablename} CASCADE`)
  }

  // Drop sequelize_meta
  console.info('Drop if exists: sequelize.sequelize_meta')
  await sequelize.query('DROP TABLE IF EXISTS sequelize.sequelize_meta CASCADE')

  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
