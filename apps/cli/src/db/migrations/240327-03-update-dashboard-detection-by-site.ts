import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

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
    INNER JOIN location_site ls ON dbs.location_site_id = ls.id
    WHERE ls.hidden = false;
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
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
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
