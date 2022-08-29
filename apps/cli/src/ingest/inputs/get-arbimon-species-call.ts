import { QueryTypes, Sequelize } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { SpeciesCallArbimonRow } from '../parsers/parse-species-call-arbimon-to-bio'
import { SyncQueryParams } from './sync-query-params'

export const getArbimonSpeciesCalls = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit, projectId }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const sql = `
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
      JOIN recordings r ON t.recording_id = r.recording_id
      JOIN sites s ON r.site_id = s.site_id
      JOIN projects p ON s.project_id = p.project_id
      JOIN songtypes st ON t.songtype_id = st.songtype_id
    WHERE t.deleted=0 AND r.datetime_utc IS NOT NULL
      AND (t.date_created > $syncUntilDate OR (t.date_created = $syncUntilDate AND t.template_id > $syncUntilId))
      AND p.project_id = $projectId
    ORDER BY t.date_created, t.template_id
    LIMIT $syncBatchLimit
    ;
  `
  const results = await sequelize.query<SpeciesCallArbimonRow>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit,
      projectId
    }
  })

  return results.map(row => ({
    ...row,
    updatedAt: sequelize.getDialect() === 'mysql' ? row.updatedAt.toISOString() : row.updatedAt,
    callRecordedAt: sequelize.getDialect() === 'mysql' ? row.callRecordedAt.toISOString() : row.callRecordedAt
  }))
}
