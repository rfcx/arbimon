/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'
import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/timestamps'

const TABLE_NAME = 'recording_by_site_hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      time_precision_hour_local: {
        type: DataTypes.DATE,
        primaryKey: true
      },
      location_site_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'location_site' },
          key: 'id'
        }
      },

      // Dimensions
      location_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },

      // Logging
      ...TIMESTAMP_COLUMNS,

      // Facts
      count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      counts_by_minute: {
        type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)),
        allowNull: false
      },
      total_duration_in_minutes: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
  await grant(params.context.sequelize, TABLE_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
