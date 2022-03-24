/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'

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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      slug_arbimon: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      // Facts
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      latitude_north: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      latitude_south: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      longitude_east: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      longitude_west: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
