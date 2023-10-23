/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const MATERIALIZED_VIEW_NAME = 'location_project_detection_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    create or replace materialized view ${MATERIALIZED_VIEW_NAME} as
      select
        location_project_id,
        sum(count) as detection_minutes_count,
        count(distinct taxon_species_id) as species_count,
        min(time_precision_hour_local) as min_date,
        max(time_precision_hour_local) as max_date
      from
        detection_by_site_species_hour
      group by
        location_project_id;`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`drop materialized view if exists ${MATERIALIZED_VIEW_NAME}`)
}
