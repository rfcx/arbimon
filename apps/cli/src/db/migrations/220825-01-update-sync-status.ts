import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'sync_status'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await params.context.addColumn(
    TABLE_NAME,
    'project_id',
    {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await params.context.removeColumn(TABLE_NAME, 'project_id')
}
