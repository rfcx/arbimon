import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_sites'

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
      type: DataTypes.STRING(12), // MoLQA8aNulGb
      allowNull: false
    },
    id_arbimon: {
      type: DataTypes.INTEGER, // 8412
      allowNull: false
    },
    /** DIMENSIONS **/
    location_project_id: {
      type: DataTypes.INTEGER, // 1
      allowNull: false
    },
    /** FACTS **/
    name: {
      type: DataTypes.STRING(255), // 'CU26'
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT, // 18.31307
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT, // -65.24878
      allowNull: false
    },
    altitude: {
      type: DataTypes.FLOAT, // 30.85246588
      allowNull: false
    }
  })

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
