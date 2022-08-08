import { Sequelize } from 'sequelize'

/**
 * This script resets a PostgreSQL sequence based on the current max `id`
 *
 * Sequelize does not update sequences (ex: autoIncrement) after a bulkCreate where
 * you pass in your own PKs (i.e. when you include `id` in your `data`)
 *
 * See https://github.com/sequelize/sequelize/issues/9295
 *
 * Guidance:
 * - Local: it should be safe to use in local seeders
 * - Production: it's probably a bad idea to use bulkCreate with fixed IDs (let the sequence auto-assign IDs)
 */
export const fixPkDesync = async (sequelize: Sequelize, tableName: string, pkName = 'id'): Promise<void> => {
  await sequelize.query(`SELECT setval('${tableName}_${pkName}_seq', (SELECT max(id) FROM ${tableName}), true);`)
}

export const fixPkDesyncs = async (sequelize: Sequelize, tableNames: string[]): Promise<void> => {
  for (const tableName of tableNames) {
    await fixPkDesync(sequelize, tableName)
  }
}
