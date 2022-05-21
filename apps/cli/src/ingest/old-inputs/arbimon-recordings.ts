import { QueryTypes, Sequelize } from 'sequelize'

import { RecordingBySourceSiteHour } from '@rfcx-bio/common/dao/types'

export interface ArbimonRecordingSummaries {
  'projectId': number
  'siteId': number
  'hour': number
  'date': string
  'recordingMinutes': string
  'durationMinutes': number
}

export const getArbimonRecordingSummaries = async (sequelize: Sequelize, projectIdArbimons: number[]): Promise<ArbimonRecordingSummaries[]> => {
const mysqlSQL = `
  SELECT  s.project_id projectId,
          r.site_id siteId,
          HOUR(r.datetime) hour,
          DATE(r.datetime) date,
          GROUP_CONCAT(DISTINCT MINUTE (r.datetime) SEPARATOR ',') recordingMinutes,
          SUM(r.duration)/60 durationMinutes 
  FROM recordings r 
  JOIN sites s ON r.site_id = s.site_id
  WHERE s.project_id IN (${projectIdArbimons.join(',')})
  GROUP BY HOUR(r.datetime), DATE(r.datetime), r.site_id
`

const sqliteSQL = `
  SELECT  s.project_id projectId,
          r.site_id siteId,
          strftime('%H',r.datetime) hour,
          DATE(r.datetime) date,
          GROUP_CONCAT(DISTINCT strftime('%M',r.datetime)) recordingMinutes
          SUM(r.duration)/60 durationMinutes 
  FROM recordings r 
  JOIN sites s ON r.site_id = s.site_id
  WHERE s.project_id IN (${projectIdArbimons.join(',')})
  GROUP BY strftime('%H',r.datetime), DATE(r.datetime), r.site_id
`

const sql = sequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL
const results: ArbimonRecordingSummaries[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
return results
}

export const tranformArbimonToBioRecordingSummaries = async (arbimonSummaries: ArbimonRecordingSummaries[], bioSequelize: Sequelize): Promise<RecordingBySourceSiteHour[]> => {
  return arbimonSummaries.map(s => {
    return {
      timePrecisionHourLocal: new Date(),
      sourceId: 1, // TODO: map source
      projectSiteId: 3, // TODO: map site
      recordingMinutes: s.recordingMinutes // s.recordingMinutes.split(',').map(sn => Number(sn)),
    }
  })
}
