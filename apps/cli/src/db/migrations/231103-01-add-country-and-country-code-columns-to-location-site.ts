import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_site'
const COLUMN_COUNTRY = 'country'
const COLUMN_COUNTRY_CODE = 'country_code'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_COUNTRY} varchar(255) default null;`)
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_COUNTRY_CODE} varchar(2) default null;`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${COLUMN_COUNTRY};`)
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${COLUMN_COUNTRY_CODE};`)
}
