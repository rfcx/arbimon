import { QueryTypes, Sequelize } from 'sequelize'

/**
 * See: https://docs.timescale.com/api/latest/hypertable/create_hypertable/
 */
export const createHypertable = async (sequelize: Sequelize, tableName: string, timeColumnName: string): Promise<unknown> =>
  await sequelize.query(
    `SELECT create_hypertable('${tableName}', '${timeColumnName}');`,
    { type: QueryTypes.RAW }
  )
