/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'taxon_class'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      ...TIMESTAMP_COLUMNS,

      // SKs
      id_arbimon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },

      // Facts
      common_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
