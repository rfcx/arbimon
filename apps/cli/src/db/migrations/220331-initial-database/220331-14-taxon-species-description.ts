/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'taxon_species_description'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
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
      ...TIMESTAMP_COLUMNS,

      // Facts
      source_url: {
        type: DataTypes.STRING(511),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
