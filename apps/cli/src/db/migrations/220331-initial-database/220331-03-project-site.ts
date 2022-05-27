/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'project_site'

export const up: MigrationFn<QueryInterface> = async ({ context: { createTable, sequelize } }): Promise<void> => {
  await createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ...TIMESTAMP_COLUMNS,

      // SKs
      id_core: {
        type: DataTypes.STRING(12),
        allowNull: false
        // unique: true
      },
      id_arbimon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },

      // FKs
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'project' },
          key: 'id'
        }
      },
      project_version_first_appears_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'project_version' },
          key: 'id'
        }
      },

      // Facts
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      altitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
