/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'recording_by_site_hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  return await params.context.renameColumn(TABLE_NAME, 'total_duration', 'total_duration_in_minutes')
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.renameColumn(TABLE_NAME, 'total_duration_in_minutes', 'total_duration')
}
