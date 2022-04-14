/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'source_detection_by_sync_site_species_hour'
const COLUMN_TIME_HOUR_LOCAL = 'time_precision_hour_local'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      [COLUMN_TIME_HOUR_LOCAL]: {
        type: DataTypes.DATE(3), // hypertable key
        primaryKey: true
      },
      source_sync_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'source_sync' },
          key: 'id'
        }
      },
      project_site_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'project_site' },
          key: 'id'
        }
      },
      taxon_species_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'taxon_species' },
          key: 'id'
        }
      },

      // Logging
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },

      // Facts
      detection_minutes: {
        type: DataTypes.STRING(255), // array?!
        allowNull: false
      }
    }
  )
  .then(async () => await params.context.sequelize.query(
    `SELECT create_hypertable('${TABLE_NAME}', '${COLUMN_TIME_HOUR_LOCAL}');`,
    { type: QueryTypes.RAW }
  ))

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
