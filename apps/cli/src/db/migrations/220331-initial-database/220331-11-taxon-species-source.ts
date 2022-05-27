/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'taxon_species_source'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: { // -1, 100, 200
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      ...TIMESTAMP_COLUMNS,

      // Facts
      name: { // RFCx, IUCN, Wiki
        type: DataTypes.STRING(15),
        unique: true,
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
