/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'by_version_site_species_hour_detection'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE VIEW ${VIEW_NAME} AS
    SELECT sdbsssh.time_precision_hour_local,
           pvss.project_version_id,
           sdbsssh.project_site_id,
           ts.id as taxon_species_id,
           max(sdbsssh.created_at) as created_at,
           max(sdbsssh.updated_at) as updated_at,
           ts.taxon_class_id,
           length(regexp_replace(max(sdbsssh.detection_minutes), '[^,]', '', 'g')) + 1 as count_detection_minutes -- hack until column type is fixed
    FROM project_version_source_sync pvss
        JOIN source_detection_by_sync_site_species_hour sdbsssh ON pvss.source_sync_id = sdbsssh.source_sync_id
        JOIN taxon_species ts ON sdbsssh.taxon_species_id = ts.id
    GROUP BY pvss.project_version_id, sdbsssh.time_precision_hour_local, sdbsssh.project_site_id, ts.id
    ;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
