/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const TABLE_NAME = 'location_project_profile'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
 await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      location_project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },
      // Logging
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      // Facts
      summary: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      readme: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }
  )
  await grant(params.context.sequelize, TABLE_NAME, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
