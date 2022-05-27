/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'taxon_species_file'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      taxon_species_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'taxon_species' },
          key: 'id'
        }
      },
      taxon_species_source_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'taxon_species_source' },
          key: 'id'
        }
      },
      order: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      ...TIMESTAMP_COLUMNS,

      // Facts
      file_url: {
        type: DataTypes.STRING(511),
        allowNull: false
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      mime_type: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
