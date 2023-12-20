import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/timestamps'

const TABLE_NAME = 'location_project_organization'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.createTable(TABLE_NAME, {
    location_project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: { tableName: 'location_project' },
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    organization_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: { tableName: 'organization' },
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    ...TIMESTAMP_COLUMNS
  })
  await setTimestampDefaults(params.context.sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.dropTable(TABLE_NAME)
}
