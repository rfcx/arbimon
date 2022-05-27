/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'project_version_geo'
// const INDEX_COLS = []

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  // TODO
        // latitude_north: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false
      // },
      // latitude_south: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false
      // },
      // longitude_east: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false
      // },
      // longitude_west: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false
      // }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
