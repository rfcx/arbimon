/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await Promise.all([
    await params.context.sequelize.query(`
      ALTER TABLE ${TABLE_NAME}
      DROP COLUMN IF EXISTS slug_arbimon;
    `),
    await params.context.changeColumn(TABLE_NAME, 'latitude_north', {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }),
    await params.context.changeColumn(TABLE_NAME, 'latitude_south', {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }),
    await params.context.changeColumn(TABLE_NAME, 'longitude_east', {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }),
    await params.context.changeColumn(TABLE_NAME, 'longitude_west', {
      type: DataTypes.FLOAT,
      defaultValue: 0
    })
  ])
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await Promise.all([
    // add slug arbimon column back
    await params.context.addColumn(TABLE_NAME, 'slug_arbimon', {
      type: DataTypes.STRING(255)
    }),
    // set values back to be the same as slug
    await params.context.sequelize.query(`UPDATE ${TABLE_NAME} SET slug_arbimon = slug`),
    // set the column to be unique, and not allow null
    await params.context.changeColumn(TABLE_NAME, 'slug_arbimon', {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    })
  ])
}
