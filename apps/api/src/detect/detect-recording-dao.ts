import { BindOrReplacements, QueryTypes, Sequelize, WhereOperators } from 'sequelize'

import { AllModels } from '@rfcx-bio/common/dao/model-repository'

import { Condition } from '~/datasets/dataset-where'
import { DetectRecordingQuery } from './detect-recording-bll'

export type QuerySiteName = string[] | WhereOperators
export interface TotalDurationInMinutes { totalDurationInMinutes: number }

const detectRecordingWhereRaw = (detectRecordingQuery: DetectRecordingQuery): Condition => {
  const { locationProjectId, dateStartLocal, dateEndLocal, siteIds, hours } = detectRecordingQuery
  const conditions = [
    'rbsh.time_precision_hour_local >= $dateStartLocal', // rbsh is from recording_by_site_hour
    'rbsh.time_precision_hour_local <= $dateEndLocal',
    'rbsh.location_project_id = $locationProjectId'
  ]

  const bind: BindOrReplacements = {
    locationProjectId,
    dateStartLocal,
    dateEndLocal
  }

  if (Array.isArray(siteIds) && siteIds.length > 0) {
    conditions.push('rbsh.location_site_id = ANY($siteIds)')
    bind.siteIds = siteIds
  }

  if (Array.isArray(hours) && hours.length > 0) {
    conditions.push('extract(hour from time_precision_hour_local) = ANY($hours)')
    bind.hours = hours
  }

  return { conditions: conditions.join(' AND '), bind }
}

export const getDetectRecordingTotalDurationMinutes = async (sequelize: Sequelize, detectRecordingQuery: DetectRecordingQuery): Promise<TotalDurationInMinutes> => {
  const { conditions, bind } = detectRecordingWhereRaw(detectRecordingQuery)

  const sql = `
    SELECT COALESCE(SUM(rbsh.total_duration_in_minutes), 0) AS "totalDurationInMinutes"
    FROM (
      SELECT total_duration_in_minutes
      FROM recording_by_site_hour rbsh
      WHERE ${conditions}
    ) as rbsh
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as TotalDurationInMinutes[]

  return result[0]
}

export const getSitesByNameQuery = async (models: AllModels, locationProjectId: number, name: QuerySiteName): Promise<number[]> => {
  const result = await models.LocationSite.findAll({
    attributes: ['id'],
    where: {
      name,
      locationProjectId
    },
    raw: true
  })

  return result.map(({ id }) => id)
}
