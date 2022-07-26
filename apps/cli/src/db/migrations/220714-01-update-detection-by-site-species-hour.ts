import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detection_by_site_species_hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.addColumn(
    TABLE_NAME,
    'detection_minutes',
    {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: null
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.removeColumn(TABLE_NAME, 'detection_minutes')
}
