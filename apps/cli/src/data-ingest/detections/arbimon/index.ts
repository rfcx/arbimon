import { QueryTypes, Sequelize } from 'sequelize'

export interface ArbimonHourlyDetectionSummary {
  project_id: number
  datetime: Date
  date: string // ex: "2021-04-01T00:00:00.000Z"
  hour: number
  site_id: number
  species_id: number
  detection_count: number
  duration_in_minutes: number
}

export interface ArbimonNewData {
  siteIds: number[]
  speciesIds: number[]
}

export const getArbimonHourlyDetectionsForProject = async (arbimonSequelize: Sequelize, idArbimon: number): Promise<ArbimonHourlyDetectionSummary[]> => {
  return await getArbimonHourlyDetectionsForProjects(arbimonSequelize, [idArbimon])
}

export const getArbimonHourlyDetectionsForProjects = async (arbimonSequelize: Sequelize, idArbimons: number[]): Promise<ArbimonHourlyDetectionSummary[]> => {
  const idsString = idArbimons.join(',')
  const mysqlSQL =
  // TODO: update duration_in_minutes
  `
  SELECT rvc.project_id,
       rvc.date,
       rvc.hour,
       rvc.site_id,
       rvc.species_id,
       rvc.detection_count,
       rc.duration_in_minutes 
  FROM (
    SELECT  s.project_id,
            date(r.datetime) date,
            hour(r.datetime) hour,
            r.site_id,
            rv.species_id,
            count(rv.species_id) detection_count
    FROM recordings r
    JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
    LEFT JOIN sites s ON r.site_id = s.site_id
    WHERE s.project_id IN (${idsString})
    GROUP BY s.project_id, r.site_id, date(r.datetime), hour(r.datetime), rv.species_id
  ) rvc
  JOIN (
    SELECT r.site_id, 
        hour(r.datetime) hour, 
        date(r.datetime) date, 
        SUM(r.duration)/60 duration_in_minutes
    FROM recordings r 
    WHERE r.site_id IN (SELECT site_id FROM sites WHERE project_id IN (${idsString}))
    GROUP by hour(r.datetime), date(r.datetime), r.site_id) rc
  ON rvc.hour = rc.hour AND rvc.site_id = rc.site_id
  ORDER BY rvc.date, rvc.hour, rvc.site_id, rvc.species_id
  ;
  `

  const sqliteSQL = `
  SELECT rvc.project_id,
       rvc.date,
       rvc.hour,
       rvc.site_id,
       rvc.species_id,
       rvc.detection_count,
       rc.duration_in_minutes 
  FROM (
    SELECT  s.project_id,
            r.datetime,
            date(r.datetime) date,
            strftime('%H',r.datetime) hour,
            r.site_id,
            rv.species_id,
            count(1)            detection_count
    FROM recordings r
    LEFT JOIN recording_validations rv
      ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
    JOIN sites s ON r.site_id = s.site_id
    WHERE s.project_id in (${idsString}) and rv.species_id is not NULL 
    GROUP BY s.project_id, r.site_id, date(r.datetime), strftime('%H',r.datetime), rv.species_id
  ) rvc
  JOIN (
    SELECT r.site_id, 
        strftime('%H',r.datetime) hour, 
        date(r.datetime) date, 
        SUM(r.duration)/60 duration_in_minutes
    FROM recordings r 
    WHERE r.site_id IN (SELECT site_id FROM sites WHERE project_id IN (${idsString}))
    GROUP by strftime('%H',r.datetime), r.site_id
  ) rc
  ON rvc.hour = rc.hour AND rvc.date = rc.date AND rvc.site_id = rc.site_id
  ORDER BY rvc.date, rvc.hour, rvc.site_id, rvc.species_id
  ;
  `

  // Query Arbimon
  const sql = arbimonSequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL
  const results: ArbimonHourlyDetectionSummary[] = await arbimonSequelize.query(sql, { type: QueryTypes.SELECT, raw: true })

  // Calculate detection frequency
  return results
}
