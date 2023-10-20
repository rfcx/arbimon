import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    drop view if exists ${VIEW_NAME};
    create or replace view ${VIEW_NAME} as
      select 
        location_project_recording_metric.location_project_id,
        location_project_detection_metric.species_count,
        location_project_recording_metric.recording_minutes_count,
        location_project_detection_metric.detection_minutes_count,
        location_project_recording_metric.min_date as recording_min_date,
        location_project_recording_metric.max_date as recording_max_date,
        location_project_detection_metric.min_date as detection_min_date,
        location_project_detection_metric.max_date as detection_max_date
      from location_project_recording_metric
      inner join
        location_project_detection_metric on location_project_recording_metric.location_project_id = location_project_detection_metric.location_project_id;`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
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
    ON d.location_project_id = rbsh.location_project_id;`)
}
