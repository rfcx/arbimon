/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project_profile'
const KEY_RESULT_COLUMN = 'key_result'
const RESOURCES_COLUMN = 'resources'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
      ALTER TABLE ${TABLE_NAME}
      ADD COLUMN ${KEY_RESULT_COLUMN} text not null default '',
      ADD COLUMN ${RESOURCES_COLUMN} text not null default '';`
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${KEY_RESULT_COLUMN}, DROP COLUMN IF EXISTS ${RESOURCES_COLUMN};`)
}
