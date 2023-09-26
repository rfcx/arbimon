/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_species_threatened'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE OR REPLACE VIEW ${VIEW_NAME} AS
      SELECT
        sip.location_project_id,
        sip.taxon_species_id,
        sip.taxon_class_slug,
        sip.taxon_species_slug,
        sip.scientific_name,
        sip.risk_rating_id,
        sip.common_name,
        sip.photo_url
      FROM species_in_project sip
      JOIN risk_rating_iucn rri on sip.risk_rating_id = rri.id
      WHERE rri.is_threatened
      ORDER BY sip.risk_rating_id DESC, sip.scientific_name;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
}
