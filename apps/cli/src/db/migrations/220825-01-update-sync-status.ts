import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'sync_status'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await Promise.all([
    await params.context.removeConstraint(TABLE_NAME, 'sync_status_pkey'),
    await params.context.addColumn(
      TABLE_NAME,
      'project_id',
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    )
  ])
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await Promise.all([
    await params.context.addConstraint(TABLE_NAME, {
      type: 'unique',
      fields: ['sync_source', 'sync_data_type'],
      name: 'sync_status_pkey'
    }),
    await params.context.removeColumn(TABLE_NAME, 'project_id')
  ])
}
