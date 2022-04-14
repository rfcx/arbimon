import { QueryTypes, Sequelize } from 'sequelize'

import { SourceDetectionBySyncSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

export interface ArbimonDetectionSummaries {
  'projectId': number
  'siteId': number
  'speciesId': number
  'hour': number
  'date': string
  'detectionMinutes': string
}

export const getArbimonDetectionSummaries = async (sequelize: Sequelize, projectIdArbimons: number[]): Promise<ArbimonDetectionSummaries[]> => {
const mysqlSQL = `
  SELECT  s.project_id projectId,
          r.site_id siteId,
          rv.species_id speciesId,
          DATE(r.datetime) date,
          HOUR(r.datetime) hour,
          GROUP_CONCAT(DISTINCT MINUTE (r.datetime) SEPARATOR ',') detectionMinutes
  FROM recordings r
  JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
  LEFT JOIN sites s ON r.site_id = s.site_id
  WHERE s.project_id IN (${projectIdArbimons.join(',')}) AND rv.species_id IS NOT NULL
  GROUP BY s.project_id, r.site_id, DATE(r.datetime), HOUR(r.datetime), rv.species_id
`

const sqliteSQL = `
  SELECT  s.project_id projectId,
          r.site_id siteId,
          rv.species_id speciesId,
          DATE(r.datetime) date,
          strftime('%H',r.datetime) hour,
          GROUP_CONCAT(DISTINCT strftime('%M',r.datetime)) detectionMinutes
  FROM recordings r
  JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
  LEFT JOIN sites s ON r.site_id = s.site_id
  WHERE s.project_id IN (${projectIdArbimons.join(',')}) AND rv.species_id IS NOT NULL
  GROUP BY s.project_id, r.site_id, DATE(r.datetime), strftime('%H',r.datetime), rv.species_id
`

  const sql = sequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL
  const results: ArbimonDetectionSummaries[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
  return results
}

export const tranformArbimonToBioDetectionSummaries = async (arbimonSummaries: ArbimonDetectionSummaries[], bioSequelize: Sequelize): Promise<SourceDetectionBySyncSiteSpeciesHour[]> => {
  return arbimonSummaries.map(s => {
    // TODO: map source
    // TODO: map site id
    // TODO: map species id
    return {
      timePrecisionHourLocal: new Date(),
      sourceSyncId: 1,
      projectSiteId: 2,
      taxonSpeciesId: 3,
      detectionMinutes: s.detectionMinutes.split(',').map(sn => Number(sn))
    }
  })
}
