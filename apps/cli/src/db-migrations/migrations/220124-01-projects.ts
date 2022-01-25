import { mapValues } from 'lodash-es'
import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { defaultDisallowNull } from '../helpers'

const TABLE_NAME = 'location_projects' // Do not import constants! Migrations are immutable

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    mapValues({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      /** EXTERNAL **/
      id_core: { type: DataTypes.STRING(12) },
      id_arbimon: { type: DataTypes.INTEGER },
      /** FACTS **/
      slug: { type: DataTypes.STRING(255) },
      name: { type: DataTypes.STRING(255) },
      latitude_north: { type: DataTypes.FLOAT },
      latitude_south: { type: DataTypes.FLOAT },
      longitude_east: { type: DataTypes.FLOAT },
      longitude_west: { type: DataTypes.FLOAT }
    }, defaultDisallowNull)
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
