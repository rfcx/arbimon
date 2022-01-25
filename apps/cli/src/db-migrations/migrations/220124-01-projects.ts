import { mapValues } from 'lodash-es'
import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { defaultDisallowNull } from '../helpers'

const TABLE_NAME = 'location_projects' // Do not import constants! Migrations are immutable

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    mapValues({
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // External
      idCore: { type: DataTypes.STRING(12) },
      idArbimon: { type: DataTypes.INTEGER },
      // Facts
      slug: { type: DataTypes.STRING(255) },
      name: { type: DataTypes.STRING(255) },
      latitudeNorth: { type: DataTypes.FLOAT },
      latitudeSouth: { type: DataTypes.FLOAT },
      longitudeEast: { type: DataTypes.FLOAT },
      longitudeWest: { type: DataTypes.FLOAT }
    }, defaultDisallowNull)
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
