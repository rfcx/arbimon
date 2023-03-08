/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'project_version'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
 await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      // FKs
      location_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },
      // Facts
      is_published: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
