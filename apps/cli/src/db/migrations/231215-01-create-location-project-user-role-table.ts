import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/220331-timestamps'

const TABLE_NAME = 'location_project_user_role'

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
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: { tableName: 'user_profile' },
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    role_id: {
      type: DataTypes.INTEGER,
      // INFO: Guest role based on roles table in legacy arbimon.
      // Roles are stored code side.
      defaultValue: 3,
      allowNull: false
    },
    ranking: {
      type: DataTypes.INTEGER,
      // INFO:
      // -1 means hidden from the stakeholders page.
      // 0 means primary contact user.
      // anything above 1 means you are displayed on the stakeholders page.
      defaultValue: -1,
      allowNull: false
    },
    ...TIMESTAMP_COLUMNS
  })

  await setTimestampDefaults(params.context.sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.dropTable(TABLE_NAME)
}
