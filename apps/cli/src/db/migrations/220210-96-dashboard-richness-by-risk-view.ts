/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'dashboard_richness_by_risk'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create view ${VIEW_NAME} as
    SELECT sip.location_project_id,
           sip.risk_rating_id,
           Count(1) AS count
    FROM species_in_project sip
    GROUP BY sip.location_project_id, sip.risk_rating_id
    ORDER BY sip.location_project_id, sip.risk_rating_id DESC
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
