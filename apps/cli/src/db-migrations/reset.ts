import { QueryTypes } from 'sequelize'

import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)

  // Drop all public tables
  const tables = await sequelize.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'', { type: QueryTypes.SELECT })
  console.log(tables.map(t => t.tablename))
  for (const table of tables) {
    await sequelize.query(`DROP TABLE IF EXISTS public.${table.tablename} CASCADE`)
  }

  // Drop sequelize_meta
  await sequelize.query('DROP TABLE IF EXISTS sequelize.sequelize_meta CASCADE')

  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
