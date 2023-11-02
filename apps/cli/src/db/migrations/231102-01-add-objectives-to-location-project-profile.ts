import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project_profile'
const COLUMN_NAME = 'objectives'
const TYPE = 'text[]'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME} ${TYPE} not null default '{}';`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${COLUMN_NAME};`)
}
