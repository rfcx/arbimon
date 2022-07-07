import { Sequelize } from 'sequelize'

import { getWithQueryParams } from './get-with-query-params'
import { SyncQueryParams } from './sync-query-params'

export const getArbimonSpeciesCalls = async (sequelize: Sequelize, params: SyncQueryParams): Promise<unknown[]> => {
  return await getWithQueryParams(
    sequelize,
    params,
    `
    SELECT t.species_id AS taxonSpeciesId,
      t.project_id AS callProjectId,
      p.url AS  projectSlugArbimon,
      r.site_id AS callSiteId,
      r.datetime_utc AS callRecordedAt,
      t.x1 AS start,
      t.x2 AS end,
      s.external_id siteIdCore,
      st.songtype AS callType,
      t.recording_id AS recordingId,
      s.timezone AS callTimezone,
      t.date_created as updatedAt,
      t.template_id as idArbimon
    FROM templates t
      JOIN songtypes st ON t.songtype_id = st.songtype_id
      JOIN sites s ON r.site_id = s.site_id
      JOIN projects p ON s.project_id = p.project_id
      JOIN recordings r ON t.recording_id = r.recording_id
    WHERE t.deleted=0 AND r.datetime_utc IS NOT NULL
      AND t.date_created > $syncUntilDate
      OR (t.date_created = $syncUntilDate AND t.template_id > $syncUntilId)
    ORDER BY t.date_created, t.template_id
    LIMIT $syncBatchLimit
    ;
    `
  )
}
