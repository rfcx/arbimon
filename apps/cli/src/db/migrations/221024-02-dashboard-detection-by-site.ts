/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_detection_by_site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE OR REPLACE VIEW ${VIEW_NAME} AS
    SELECT ls.location_project_id,
           ls.name,
           ls.latitude,
           ls.longitude,
           dbs.count
    FROM detection_by_site dbs
    INNER JOIN location_site ls ON dbs.location_site_id = ls.id;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
