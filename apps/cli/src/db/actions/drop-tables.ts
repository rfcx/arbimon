import { QueryTypes, Sequelize } from 'sequelize'

export const dropTables = async (sequelize: Sequelize): Promise<void> => {
  // Drop all public tables
  const tables = await sequelize.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'', { type: QueryTypes.SELECT })
  for (const table of tables) {
    console.info(`Drop if exists: public.${table.tablename}`)
    await sequelize.query(`DROP TABLE IF EXISTS public.${table.tablename} CASCADE`)
  }

  // Drop "sequelize_meta"
  console.info('Drop if exists: sequelize.migrations')
  await sequelize.query('DROP TABLE IF EXISTS sequelize.migrations CASCADE')

  console.info('Drop if exists: sequelize.seeders')
  await sequelize.query('DROP TABLE IF EXISTS sequelize.seeders CASCADE')
}
