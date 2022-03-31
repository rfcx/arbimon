/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

 const TABLE_NAME = 'detection_source'

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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
   )

 export const down: MigrationFn<QueryInterface> = async (params) =>
   await params.context.dropTable(TABLE_NAME)
