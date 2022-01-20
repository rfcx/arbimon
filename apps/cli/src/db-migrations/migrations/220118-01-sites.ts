import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'location_sites'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    /** DIMENSIONS **/
    // ???: ??? -- representing Puerto Rico Island-Wide
    location_project_id: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    // ???: ??? -- representing Puerto Rico Island-Wide
    location_project_id_core: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
     // ???: ??? -- representing Puerto Rico Island-Wide
    location_project_id_arbimon: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    // stream_id: 'MoLQA8aNulGb',
    location_site_id_core: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    // arbimon_site_id: 8412,
    location_site_id_arbimon: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    /** FACTS **/
    // name: 'CU26',
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // latitude: 18.31307,
    latitude: {
      type: DataTypes.FLOAT(),
      allowNull: false
    },
    // longitude: -65.24878,
    longitude: {
      type: DataTypes.FLOAT(),
      allowNull: false
    },
    // altitude: 30.85246588
    altitude: {
      type: DataTypes.FLOAT(),
      allowNull: false
    }
  })

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
