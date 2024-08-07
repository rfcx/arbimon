/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'dashboard_detection_by_site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create view ${VIEW_NAME} as
    SELECT ls.location_project_id,
           ls.name,
           ls.latitude,
           ls.longitude,
           data.count
    FROM (
        SELECT location_project_id,
               location_site_id,
               sum(count)::integer AS count
        FROM detection_by_site_hour
        GROUP BY location_project_id, location_site_id
    ) data
    INNER JOIN location_site ls ON data.location_site_id = ls.id
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
