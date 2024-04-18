import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Drop dependent views
  await params.context.sequelize.query('DROP VIEW IF EXISTS dashboard_detection_by_site')
  await params.context.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS detection_by_site')
}
