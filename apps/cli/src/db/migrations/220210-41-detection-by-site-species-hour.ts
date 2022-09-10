/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from './_helpers/220331-timestamps'

const TABLE_NAME = 'detection_by_site_species_hour'
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
      ...TIMESTAMP_COLUMNS,

      // Dimensions
      location_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },
      taxon_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'taxon_class' },
          key: 'id'
        }
      },

      // Facts
      count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      counts_by_minute: {
        type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)),
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
