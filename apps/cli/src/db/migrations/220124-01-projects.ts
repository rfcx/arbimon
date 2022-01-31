/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_projects'

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
      // External
      id_core: {
        type: DataTypes.STRING(12),
        allowNull: false
      },
      id_arbimon: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      // Facts
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
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
