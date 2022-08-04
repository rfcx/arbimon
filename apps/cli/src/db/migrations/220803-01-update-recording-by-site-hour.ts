import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'recording_by_site_hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.addColumn(
    TABLE_NAME,
    'recording_count',
    {
      type: DataTypes.INTEGER,
      defaultValue: null
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.removeColumn(TABLE_NAME, 'recording_count')
}
