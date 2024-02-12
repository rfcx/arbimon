import { type QueryInterface, QueryTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

export const up: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query('insert into sync_data_type (id, name) values ($1, $2)', {
    bind: [
      800,
      'Opensearch'
    ],
    type: QueryTypes.INSERT
  })
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query('delete from sync_data_type where id = 800', { type: QueryTypes.DELETE })
}
