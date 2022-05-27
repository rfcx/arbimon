/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'risk_rating'

export const up: MigrationFn<QueryInterface> = async ({ context: { createTable, sequelize } }): Promise<void> => {
  await createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      ...TIMESTAMP_COLUMNS,

      // SKs
      code: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true
      },

      // Facts
      is_threatened: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      is_protected: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
