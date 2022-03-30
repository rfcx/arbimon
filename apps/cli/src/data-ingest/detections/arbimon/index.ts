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
  SELECT  s.project_id,
          date(r.datetime) date,
          hour(r.datetime) hour,
          r.site_id,
          rv.species_id,
          count(1) detection_count,
          dc.duration_in_minutes
  FROM recordings r
  LEFT JOIN recording_validations rv
    ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
  JOIN sites s ON r.site_id = s.site_id
  JOIN (
    select r.site_id, hour(r.datetime) hour, date(r.datetime) date, sum(r.duration)/60 duration_in_minutes
    from recordings r 
    where r.site_id in (select site_id from sites where project_id in (${idsString}))
    GROUP by hour(r.datetime), r.site_id
  ) AS dc ON dc.site_id = s.site_id and dc.hour = hour and dc.date = date
  WHERE s.project_id in (${idsString}) and rv.species_id is not NULL 
  GROUP BY s.project_id, r.site_id, date(r.datetime), hour(r.datetime), rv.species_id
  ;
  `

  const sqliteSQL = `
  SELECT  s.project_id,
          r.datetime,
          date(r.datetime) date,
          strftime('%H',r.datetime) hour,
          r.site_id,
          rv.species_id,
          count(1)            detection_count,
          dc.duration_in_minutes
  FROM recordings r
  LEFT JOIN recording_validations rv
    ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
  JOIN sites s ON r.site_id = s.site_id
  JOIN (
    select r.site_id, hour(r.datetime) hour, date(r.datetime) date, sum(r.duration)/60 duration_in_minutes
    from recordings r 
    where r.site_id in (select site_id from sites where project_id in (${idsString}))
    GROUP by hour(r.datetime), r.site_id
  ) AS dc ON dc.site_id = s.site_id and dc.hour = hour and dc.date = date
  WHERE s.project_id in (${idsString}) and rv.species_id is not NULL 
  GROUP BY s.project_id, r.site_id, date(r.datetime), strftime('%H',r.datetime), rv.species_id
  ;
  `

  // Query Arbimon
  const sql = arbimonSequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL
  const results: ArbimonHourlyDetectionSummary[] = await arbimonSequelize.query(sql, { type: QueryTypes.SELECT, raw: true })

  // Calculate detection frequency
  return results
}
