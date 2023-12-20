/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const TABLE_NAME = 'cache_user_project'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
 await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      user_id_auth0: {
        type: DataTypes.STRING,
        primaryKey: true
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
      project_core_ids: {
        type: DataTypes.ARRAY(DataTypes.STRING(255)),
        allowNull: false
      },
      expired_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }
  )
  await grant(params.context.sequelize, TABLE_NAME, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
