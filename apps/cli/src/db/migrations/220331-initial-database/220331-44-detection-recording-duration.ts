/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detection_recording_duration'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      detection_set_hash: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        references: {
          model: { tableName: 'detection_set' },
          key: 'detection_set_hash'
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
      time_start_precision_minute_local: {
        type: DataTypes.DATE(3),
        primaryKey: true
      },
      time_end_precision_minute_local: {
        type: DataTypes.DATE(3),
        primaryKey: true
      },

      // Logging
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
