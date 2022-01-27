import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detections_by_hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(TABLE_NAME, {
    /** DIMENSIONS **/
    // date: '2021-03-18T00:00:00.000Z',
    // hour: 11,
    time_precision_hour: {
      type: DataTypes.DATE(),
      allowNull: false,
      primaryKey: true
    },
    location_project_id: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    location_site_id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true
    },
    // taxon_id: 1,
    taxon_class_id: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    // species_id: 34,
    taxon_species_id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true
    },
    /** FACTS **/
    // num_of_recordings: 1,
    detection_count: {
      type: DataTypes.INTEGER(),
      allowNull: false
    },
    // detection_frequency: 0.08333333333333333
    detection_frequency: {
      type: DataTypes.FLOAT(),
      allowNull: false
    }
  })

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
