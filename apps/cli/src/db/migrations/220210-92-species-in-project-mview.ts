/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'species_in_project'
// const INDEX_COLS = ['location_project_id', 'taxon_class_id', 'taxon_species_id']

// TODO: Add some logic for picking which photo to show
export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create view ${VIEW_NAME} as
    SELECT species.location_project_id, species.taxon_class_id, species.taxon_class_slug, species.taxon_species_id,
           species.taxon_species_slug, species.scientific_name, species.common_name, species.risk_rating_global_id,
           species.photo_url, species.description, species.source_url, species.source_cite,
           COALESCE(lps.risk_rating_local_level, -1) AS risk_rating_local_id,
           CASE
               WHEN (lps.risk_rating_local_level > species.risk_rating_global_id) THEN lps.risk_rating_local_level
               ELSE species.risk_rating_global_id
           END AS risk_rating_id,
           species.detection_min_hour_local,
           species.detection_max_hour_local
    FROM (
          SELECT d.location_project_id,
                ts.taxon_class_id,
                tc.slug                                    AS taxon_class_slug,
                ts.id                                      AS taxon_species_id,
                ts.slug                                    AS taxon_species_slug,
                ts.scientific_name,
                CASE
                    WHEN MAX(tsr.common_name) <> '' THEN MAX(tsr.common_name)
                    WHEN MAX(tsi.common_name) <> '' THEN MAX(tsi.common_name)
                    ELSE ''
                    END                                    AS common_name,
                COALESCE(MAX(tsi.risk_rating_iucn_id), -1) AS risk_rating_global_id,
                MAX(tsp.photo_url)                         AS photo_url,
                CASE
                    WHEN MAX(tsr.description) <> '' THEN MAX(tsr.description)
                    WHEN MAX(tsi.description) <> '' THEN MAX(tsi.description)
                    WHEN MAX(tsw.description) <> '' THEN MAX(tsw.description)
                    ELSE ''
                    END                                    AS description,
                CASE
                    WHEN MAX(tsr.description) <> '' THEN ''
                    WHEN MAX(tsi.description) <> '' THEN MAX(tsi.description_source_url)
                    WHEN MAX(tsw.description) <> '' THEN MAX(tsw.description_source_url)
                    ELSE ''
                    END                                    AS source_url,
                CASE
                    WHEN MAX(tsr.description) <> '' THEN ''
                    WHEN MAX(tsi.description) <> '' THEN 'IUCN Red List'
                    WHEN MAX(tsw.description) <> '' THEN 'Wikipedia'
                    ELSE ''
                    END                                    AS source_cite,
                MIN(d.time_precision_hour_local) detection_min_hour_local,
                MAX(d.time_precision_hour_local) detection_max_hour_local
          FROM detection_by_site_species_hour d
                  JOIN taxon_species ts ON d.taxon_species_id = ts.id
                  JOIN taxon_class tc ON ts.taxon_class_id = tc.id
                  LEFT JOIN taxon_species_rfcx tsr ON ts.id = tsr.taxon_species_id
                  LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
                  LEFT JOIN taxon_species_wiki tsw ON ts.id = tsw.taxon_species_id
                  LEFT JOIN taxon_species_photo tsp ON ts.id = tsp.taxon_species_id
          GROUP BY d.location_project_id, ts.id, tc.slug
      ) species
      LEFT JOIN location_project_species lps
          ON species.location_project_id = lps.location_project_id
          AND species.taxon_species_id = lps.taxon_species_id`
  )

  // for (const indexCol of INDEX_COLS) {
  //   await params.context.sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }

  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
