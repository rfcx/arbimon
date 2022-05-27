/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'project_profile'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'project' },
          key: 'id'
        }
      },
      ...TIMESTAMP_COLUMNS,

      // Facts
      summary: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      readme: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
