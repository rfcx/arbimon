/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/timestamps'

const TABLE_NAME = 'sync_error'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      sync_source_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'sync_source' },
          key: 'id'
        }
      },
      sync_data_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'sync_data_type' },
          key: 'id'
        }
      },
      ...TIMESTAMP_COLUMNS,

      // Fact
      external_id: {
        type: DataTypes.STRING(12),
        primaryKey: true,
        allowNull: false
      },
      error: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
