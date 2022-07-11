/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'sync_error'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.changeColumn(TABLE_NAME, 'external_id', {
    type: DataTypes.STRING(72),
    primaryKey: true,
    allowNull: false
  })
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.changeColumn(TABLE_NAME, 'external_id', {
    type: DataTypes.STRING(12),
    primaryKey: true,
    allowNull: false
  })
}
