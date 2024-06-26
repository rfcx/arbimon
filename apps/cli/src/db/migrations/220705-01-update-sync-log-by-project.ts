/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import type { QueryInterface } from 'sequelize'
import { DataTypes } from 'sequelize'
import type { MigrationFn } from 'umzug'

const TABLE_NAME = 'sync_log_by_project'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.addColumn(TABLE_NAME, 'location_project_id', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: { tableName: 'location_project' },
      key: 'id'
    }
  })
  await params.context.sequelize.query(`
    ALTER TABLE ${TABLE_NAME}
    DROP COLUMN IF EXISTS project_id;
  `)
}
