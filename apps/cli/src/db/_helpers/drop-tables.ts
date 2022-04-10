import { QueryTypes, Sequelize } from 'sequelize'

import { SCHEMA_SEQUELIZE, TABLE_SEQUELIZE_MIGRATIONS, TABLE_SEQUELIZE_SEEDERS } from '@/db/connections/table-names'

export const dropTables = async (sequelize: Sequelize): Promise<void> => {
  // Drop all public tables
  const tables = await sequelize.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'', { type: QueryTypes.SELECT })

  console.info('Dropping tables (if exists):')
  for (const table of tables) {
    console.info(`- public.${table.tablename}`)
    await sequelize.query(`DROP TABLE IF EXISTS public.${table.tablename} CASCADE`)
  }

  // Drop "sequelize_meta"
  const migrationsTable = `${SCHEMA_SEQUELIZE}.${TABLE_SEQUELIZE_MIGRATIONS}`
  console.info(`- ${migrationsTable}`)
  await sequelize.query(`DROP TABLE IF EXISTS ${migrationsTable} CASCADE`)

  const seedersTable = `${SCHEMA_SEQUELIZE}.${TABLE_SEQUELIZE_SEEDERS}`
  console.info(`- ${seedersTable}`)
  await sequelize.query(`DROP TABLE IF EXISTS ${seedersTable} CASCADE`)
}
