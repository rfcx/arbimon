/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

 const TABLE_NAME = 'source_sync'

 export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
   await params.context.createTable(
     TABLE_NAME,
     {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      // SKs
      hash: DataTypes.STRING(255), // 1239eb4a8416af46c0448426b51771f5

      // FKs
      project_id: {
        type: DataTypes.INTEGER,
        references: {
          model: { tableName: 'project' },
          key: 'id'
        }
      },
      source_id: {
        type: DataTypes.INTEGER,
        references: {
          model: { tableName: 'source' },
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
      summary_text: { // species +3 -2
        type: DataTypes.JSON
      },
      raw_data: { // species +3 -2
        type: DataTypes.JSON
      }
    }
   )

 export const down: MigrationFn<QueryInterface> = async (params) =>
   await params.context.dropTable(TABLE_NAME)
