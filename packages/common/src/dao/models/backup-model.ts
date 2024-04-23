import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type Backup } from '../types/backup'

export const MODEL_BACKUP = 'Backup'
export const TABLE_BACKUP = 'backup'

export const BackupModel = defineWithDefaultsAutoPk<Backup>(
    MODEL_BACKUP,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity: {
            type: DataTypes.STRING
        },
        entityId: {
            type: DataTypes.INTEGER
        },
        requestedBy: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user_profile',
                key: 'id'
            }
        },
        requestedAt: {
            type: DataTypes.DATE
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true // this will be set when the url is created in the cron job
        },
        status: {
            type: DataTypes.STRING
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: TABLE_BACKUP,
        timestamps: false
    }
)
