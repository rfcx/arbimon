import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SpeciesCallArbimonRow } from '../parsers/parse-species-call-arbimon-to-bio'
import { type SyncQueryParams } from './sync-query-params'

export const getArbimonSpeciesCalls = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
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
    WHERE t.deleted = 0 
      AND t.source_project_id IS NULL
      AND r.datetime_utc IS NOT NULL
      AND t.date_created > $syncUntilDate OR (t.date_created = $syncUntilDate AND t.template_id > $syncUntilId)
      AND s.deleted_at IS NULL
    ORDER BY t.date_created, t.template_id
    LIMIT $syncBatchLimit
  `

  const results = await sequelize.query<SpeciesCallArbimonRow>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit: String(syncBatchLimit)
    }
  })

  return results.map(row => ({
    ...row,
    updatedAt: sequelize.getDialect() === 'mysql' ? row.updatedAt.toISOString() : row.updatedAt,
    callRecordedAt: sequelize.getDialect() === 'mysql' ? row.callRecordedAt.toISOString() : row.callRecordedAt
  }))
}

export const getArbimonProjectSpeciesCalls = async (sequelize: Sequelize, projectId: number): Promise<SpeciesCallArbimonRow[]> => {
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
    WHERE t.project_id = $projectId
      AND t.deleted = 0
      AND t.source_project_id is null
      AND r.datetime_utc is not null
      AND s.deleted_at is null
    ORDER BY t.template_id
  `
  return await sequelize.query<SpeciesCallArbimonRow>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId: String(projectId)
    }
  })
}
