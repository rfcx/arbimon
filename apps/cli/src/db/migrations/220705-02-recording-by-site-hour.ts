/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/220331-timestamps'

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
      location_project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },
      location_site_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'location_site' },
          key: 'id'
        }
      },

      // Logging
      ...TIMESTAMP_COLUMNS,

      // Facts
      total_duration: DataTypes.FLOAT,
      recorded_minutes: DataTypes.ARRAY(DataTypes.INTEGER)
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) => await params.context.dropTable(TABLE_NAME)
