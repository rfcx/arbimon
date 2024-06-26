/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import type { QueryInterface } from 'sequelize'
import { DataTypes } from 'sequelize'
import type { MigrationFn } from 'umzug'

const TABLE_NAME = 'project_version'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.changeColumn(TABLE_NAME, 'is_published', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  })
  await params.context.changeColumn(TABLE_NAME, 'is_public', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  })
}
