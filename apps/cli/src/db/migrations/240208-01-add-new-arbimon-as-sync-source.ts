import { type QueryInterface, QueryTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

export const up: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query('insert into sync_source (id, name) values ($1, $2)', {
    bind: [
      300,
      'New Arbimon'
    ],
    type: QueryTypes.INSERT
  })
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query('delete from sync_source where id = 300', { type: QueryTypes.DELETE })
}
