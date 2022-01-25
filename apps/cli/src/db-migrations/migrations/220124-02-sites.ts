import { mapValues } from 'lodash-es'
import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_sites' // Do not import constants! Migrations are immutable

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    mapValues({
      id: {
        type: DataTypes.INTEGER, // 1
        primaryKey: true,
        autoIncrement: true
      },
      /** EXTERNAL **/
      id_core: { type: DataTypes.STRING(12) },
      id_arbimon: { type: DataTypes.INTEGER },
      /** DIMENSIONS **/
      location_project_id: { type: DataTypes.INTEGER },
      /** FACTS **/
      name: { type: DataTypes.STRING(255) },
      latitude: { type: DataTypes.FLOAT },
      longitude: { type: DataTypes.FLOAT },
      altitude: { type: DataTypes.FLOAT }
    }, col => ({ allowNull: false, ...col })) // TODO: Extract this (can't work out the right type!)
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
