import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_projects'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER, // 1
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    /** EXTERNAL **/
    id_core: {
      type: DataTypes.STRING(12), // ???
      allowNull: false
    },
    id_arbimon: {
      type: DataTypes.INTEGER, // ???
      allowNull: false
    },
    /** FACTS **/
    slug: {
      type: DataTypes.STRING(255), // puerto-rico-island-wide
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255), // Puerto Rico Island-Wide
      allowNull: false
    },
    latitude_north: {
      type: DataTypes.FLOAT, // 18.51375
      allowNull: false
    },
    latitude_south: {
      type: DataTypes.FLOAT, // 17.93168
      allowNull: false
    },
    longitude_east: {
      type: DataTypes.FLOAT, // -65.24505
      allowNull: false
    },
    longitude_west: {
      type: DataTypes.FLOAT, // -67.94469784
      allowNull: false
    }
  })

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
