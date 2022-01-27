import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true
      // autoIncrement: true
    }
    /** DIMENSIONS **/
    /** FACTS **/
  })

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
