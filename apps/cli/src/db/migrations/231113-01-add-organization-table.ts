import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/timestamps'

const TABLE_NAME = 'organization'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('research-institution', 'non-profit-organization', 'government-organization', 'private-organization', 'community-organization'),
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    ...TIMESTAMP_COLUMNS
  })
  await setTimestampDefaults(params.context.sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.dropTable(TABLE_NAME)
}
