/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species_photo'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.changeColumn(TABLE_NAME, 'photo_url', {
    type: DataTypes.TEXT,
    allowNull: false
  })
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.changeColumn(TABLE_NAME, 'photo_url', {
    type: DataTypes.STRING(511),
    allowNull: false
  })
}
