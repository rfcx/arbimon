import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_site'
const COLUMN_COUNTRY = 'country'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${COLUMN_COUNTRY};`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_COUNTRY} varchar(255) default null;`)
}
