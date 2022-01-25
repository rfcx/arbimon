import { mapValues } from 'lodash-es'
import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { defaultDisallowNull } from '../helpers'

const TABLE_NAME = 'location_sites' // Do not import constants! Migrations are immutable

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(
    TABLE_NAME,
    mapValues({
      // PK
      id: {
        type: DataTypes.INTEGER, // 1
        primaryKey: true,
        autoIncrement: true
      },
      // External
      idCore: { type: DataTypes.STRING(12) },
      idArbimon: { type: DataTypes.INTEGER },
      // Dimensions
      locationProjectId: { type: DataTypes.INTEGER },
      // Facts
      name: { type: DataTypes.STRING(255) },
      latitude: { type: DataTypes.FLOAT },
      longitude: { type: DataTypes.FLOAT },
      altitude: { type: DataTypes.FLOAT }
    }, defaultDisallowNull)
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
