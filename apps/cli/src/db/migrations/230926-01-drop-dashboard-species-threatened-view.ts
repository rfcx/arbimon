/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'dashboard_species_threatened'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(
    `
    CREATE VIEW ${VIEW_NAME} AS
      SELECT 
        sip.location_project_id,
        sip.taxon_species_id,
        sip.taxon_class_slug,
        sip.taxon_species_slug,
        sip.scientific_name,
        sip.risk_rating_id,
        tsi.common_name,
        tsp.photo_url
      FROM species_in_project sip
      INNER JOIN taxon_species ts ON sip.taxon_species_id = ts.id
      LEFT JOIN risk_rating_iucn rri ON sip.risk_rating_id = rri.id
      LEFT JOIN taxon_species_iucn tsi ON sip.taxon_species_id = tsi.taxon_species_id
      LEFT JOIN taxon_species_photo tsp ON sip.taxon_species_id = tsp.taxon_species_id
      WHERE rri.is_threatened
      ORDER BY sip.risk_rating_id DESC, sip.scientific_name
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
