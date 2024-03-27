import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_site'
const HIDDEN_COLUMN = 'hidden'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.addColumn(TABLE_NAME, HIDDEN_COLUMN, {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`ALTER TABLE ${TABLE_NAME} DROP COLUMN IF EXISTS ${HIDDEN_COLUMN};`)
}
