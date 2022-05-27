/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

 const TABLE_NAME = 'sync_status'

 export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
   await params.context.createTable(
     TABLE_NAME,
     {
      // PK
      source_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'source' },
          key: 'id'
        }
      },
      sync_data_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'sync_data_type' },
          key: 'id'
        }
      },
      ...TIMESTAMP_COLUMNS,

      // Fact
      sync_until_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      sync_until_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sync_batch_limit: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }
   )

 export const down: MigrationFn<QueryInterface> = async (params) =>
   await params.context.dropTable(TABLE_NAME)
