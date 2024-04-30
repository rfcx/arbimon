import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from '@/db/migrations/_helpers/grants'

const TABLE_NAME = 'backup'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
    await params.context.createTable(
        TABLE_NAME,
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            entity: {
                type: DataTypes.STRING(16),
                allowNull: false
            },
            entity_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            requested_by: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'user_profile',
                    key: 'id'
                },
                allowNull: false
            },
            requested_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: true // this will be set when the url is created in the cron job
            },
            status: {
                type: DataTypes.STRING(16),
                allowNull: false
            },
            url: {
                type: DataTypes.STRING(2000),
                allowNull: true
            },
            size: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        }
    )
    await grant(params.context.sequelize, TABLE_NAME, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.dropTable(TABLE_NAME)
}
