import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species_call'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.addColumn(
    TABLE_NAME,
    'id_arbimon',
    {
      type: DataTypes.INTEGER,
      defaultValue: null,
      unique: true
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.removeColumn(TABLE_NAME, 'id_arbimon')
}
