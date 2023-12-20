/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'location_project_metric'
// const INDEX_COLS = ['location_project_id']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    DROP VIEW IF EXISTS ${VIEW_NAME};
    CREATE OR REPLACE VIEW ${VIEW_NAME} AS     
    SELECT  rbsh.location_project_id, 
            d.site_count,
            d.species_count,
            rbsh.recording_minutes_count,
            d.detection_minutes_count,
            rbsh.min_date,
            rbsh.max_date
    FROM (
      SELECT location_project_id, 
              Sum(count)                      AS recording_minutes_count, 
              Max(time_precision_hour_local)  AS max_date, 
              Min(time_precision_hour_local)  AS min_date 
      FROM recording_by_site_hour 
      GROUP BY location_project_id
    ) rbsh
    JOIN (
      SELECT  location_project_id, 
              Sum(count)                        AS detection_minutes_count, 
              Count(distinct location_site_id) AS site_count,
              Count(distinct taxon_species_id) AS species_count
      FROM detection_by_site_species_hour 
      GROUP BY location_project_id
    ) d 
    ON d.location_project_id = rbsh.location_project_id
    ;
    `
  )

  // for (const indexCol of INDEX_COLS) {
  //   await params.context.sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(
    `
    DROP VIEW IF EXISTS ${VIEW_NAME}
    create view ${VIEW_NAME} AS
    SELECT d.location_project_id,
           Sum(d.count)                       AS detection_minutes_count,
           Count(distinct d.location_site_id) AS site_count,
           Count(distinct d.taxon_species_id) AS species_count,
           Max(d.time_precision_hour_local)   AS max_date,
           Min(d.time_precision_hour_local)   AS min_date
    FROM detection_by_site_species_hour d
    GROUP BY d.location_project_id
    ;
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
