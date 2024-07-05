import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'backup'
const MINIMUM_COLUMN_NAME = 'minimum'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    ALTER TABLE ${TABLE_NAME} 
    ADD COLUMN ${MINIMUM_COLUMN_NAME} BOOLEAN DEFAULT TRUE;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${MINIMUM_COLUMN_NAME};`)
}
