/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

 const TABLE_NAME = 'sync_status'

 export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
   await params.context.createTable(
     TABLE_NAME,
     {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      source_id: {
        type: DataTypes.INTEGER,
        references: {
          model: { tableName: 'source' },
          key: 'id'
        }
      },
      sync_data_type_id: {
        type: DataTypes.INTEGER,
        references: {
          model: { tableName: 'sync_data_type' },
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

      // Fact
      sync_until_date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }
   )

 export const down: MigrationFn<QueryInterface> = async (params) =>
   await params.context.dropTable(TABLE_NAME)
