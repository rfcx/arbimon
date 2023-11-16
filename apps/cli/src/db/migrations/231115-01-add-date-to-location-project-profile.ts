import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project_profile'
const STARTDATE_COLUMN_NAME = 'date_start'
const ENDDATE_COLUMN_NAME = 'date_end'
const TYPE = 'date'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    ALTER TABLE ${TABLE_NAME} 
    ADD COLUMN ${STARTDATE_COLUMN_NAME} ${TYPE} default null,
    ADD COLUMN ${ENDDATE_COLUMN_NAME} ${TYPE} default null;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${STARTDATE_COLUMN_NAME}, DROP COLUMN IF EXISTS ${ENDDATE_COLUMN_NAME};`)
}
