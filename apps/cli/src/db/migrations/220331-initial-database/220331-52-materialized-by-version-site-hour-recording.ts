/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

 const VIEW_NAME = 'by_version_site_hour_recording'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE VIEW ${VIEW_NAME} AS
    SELECT srbssh.time_precision_hour_local,
           pvss.project_version_id,
           srbssh.project_site_id,
           coalesce(array_length(array_agg(distinct srbssh.recording_minutes), 1), 0) as count_recording_minutes
    FROM project_version_source_sync pvss
            JOIN source_recording_by_sync_site_hour srbssh on pvss.source_sync_id = srbssh.source_sync_id
    GROUP BY pvss.project_version_id, srbssh.time_precision_hour_local, srbssh.project_site_id
    ;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
