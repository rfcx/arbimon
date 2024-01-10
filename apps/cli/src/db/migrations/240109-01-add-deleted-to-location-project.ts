import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'
const DELETEDAT_COLUMN_NAME = 'deleted_at'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    ALTER TABLE ${TABLE_NAME} 
    ADD COLUMN ${DELETEDAT_COLUMN_NAME} TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${DELETEDAT_COLUMN_NAME};`)
}
