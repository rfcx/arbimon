/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detection_set_version'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      detection_set_hash: { // 1239eb4a8416af46c0448426b51771f5
        type: DataTypes.STRING(255),
        primaryKey: true,
        references: {
          model: { tableName: 'detection_set' },
          key: 'detection_set_hash'
        }
      },
      detection_version_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'detection_version' },
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
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
