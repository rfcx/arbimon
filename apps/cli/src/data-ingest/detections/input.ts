import { mysqlSelect } from '../../_services/mysql'
import { ARBIMON_CONFIG } from '../_connections/arbimon'

export interface ArbimonHourlyDetectionSummary {
  project_id: number
  datetime: Date
  site_id: number
  species_id: number
  detection_count: number
  duration_in_minutes: number
}

export interface ArbimonNewData {
  siteIds: number[]
  speciesIds: number[]
}

export const getArbimonHourlyDetectionsForProject = async (idArbimon: number): Promise<ArbimonHourlyDetectionSummary[]> => {
  return await getArbimonHourlyDetectionsForProjects([idArbimon])
}

export const getArbimonHourlyDetectionsForProjects = async (idArbimons: number[]): Promise<ArbimonHourlyDetectionSummary[]> => {
  const sql =
  // TODO: update duration_in_minutes
  `
  SELECT  s.project_id,
          r.datetime,
          r.site_id,
          rv.species_id,
          count(1) detection_count,
          12       duration_in_minutes
  FROM recordings r
  JOIN recording_validations rv
    ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
  JOIN sites s ON r.site_id = s.site_id
  WHERE s.project_id in (?)
  GROUP BY s.project_id, r.site_id, r.datetime, rv.species_id
  ;
  `

  // Query Arbimon
  const results = await mysqlSelect<ArbimonHourlyDetectionSummary>(ARBIMON_CONFIG, sql, idArbimons)

  // Calculate detection frequency
  return results
}
