import { DataTypes, ModelAttributes, QueryTypes, Sequelize } from 'sequelize'

export const TIMESTAMP_COLUMNS: ModelAttributes = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}

export const setTimestampDefaults = async (sequelize: Sequelize, tableName: string): Promise<unknown> =>
  await sequelize.query(
    `
      ALTER TABLE ${tableName}
      ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
      ;
    `,
    { type: QueryTypes.RAW }
  )
