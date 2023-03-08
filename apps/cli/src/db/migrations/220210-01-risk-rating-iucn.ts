/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import type { QueryInterface } from 'sequelize'
import { DataTypes } from 'sequelize'
import type { MigrationFn } from 'umzug'

const TABLE_NAME = 'risk_rating_iucn'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
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
      // SKs
      code: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true
      },
      // Facts
      is_threatened: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }
  )
}

 export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
