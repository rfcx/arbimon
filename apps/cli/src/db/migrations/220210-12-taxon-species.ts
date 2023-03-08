/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species'

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
      // SKs
      id_arbimon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      // Dimensions
      taxon_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'taxon_class' },
          key: 'id'
        }
      },
      // Facts
      scientific_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
