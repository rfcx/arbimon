/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detection_by_site_species_minute'
const COLUMN_TIME_MINUTE_LOCAL = 'time_precision_minute_local'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      [COLUMN_TIME_MINUTE_LOCAL]: {
        type: DataTypes.DATE(3), // hypertable key
        primaryKey: true
      },
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
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }
  )
  .then(async () => await params.context.sequelize.query(
    `SELECT create_hypertable('${TABLE_NAME}', '${COLUMN_TIME_MINUTE_LOCAL}');`,
    { type: QueryTypes.RAW }
  ))

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
