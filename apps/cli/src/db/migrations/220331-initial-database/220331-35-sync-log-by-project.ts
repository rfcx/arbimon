/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

 const TABLE_NAME = 'sync_log_by_project'

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
      ...TIMESTAMP_COLUMNS,

      // FKs
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      sync_data_type_id: {
        type: DataTypes.INTEGER,
        references: {
          model: { tableName: 'sync_data_type' },
          key: 'id'
        }
      },

      // Fact
      delta: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }
   )

 export const down: MigrationFn<QueryInterface> = async (params) =>
   await params.context.dropTable(TABLE_NAME)
