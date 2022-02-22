/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_species_threatened'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create view ${VIEW_NAME} as
    SELECT ps.location_project_id,
           ps.taxon_species_id,
           ps.taxon_class_slug,
           ps.taxon_species_slug,
           ps.scientific_name,
           tsi.common_name,
           rri.id_ordered AS risk_rating_iucn_id,
           tsp.photo_url
    FROM species_in_project ps
          INNER JOIN taxon_species ts ON ps.taxon_species_id = ts.id
          LEFT JOIN location_project_species lps ON ts.id = lps.taxon_species_id
          LEFT JOIN risk_rating_iucn rril ON lps.risk_rating_local_level = rril.id_ordered
          LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
          LEFT JOIN risk_rating_iucn rri ON tsi.risk_rating_iucn_id = rri.id_ordered
          LEFT JOIN taxon_species_photo tsp on ts.id = tsp.taxon_species_id
    WHERE rri.is_threatened
    OR rril.is_threatened
    ORDER BY COALESCE(rril.id_ordered, rri.id_ordered) DESC, ps.scientific_name
    ;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
