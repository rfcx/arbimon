import { groupBy, mapValues, sum } from 'lodash-es'
import { Op, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionByVersionSiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { dayjs } from '../_services/dayjs-initialized'

// Similar logic with filterDetection in `controller-spotlight-dataset.ts`. Moving to common?
export async function filterDetecions (models: AllModels, projectId: number, filter: FilterDataset): Promise<DetectionByVersionSiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

  const where: Where<DetectionByVersionSiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    },
    projectId
  }

  if (siteIds.length > 0) {
    where.projectSiteId = siteIds
  }

  // ! Be careful
  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  return await models.DetectionByVersionSiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export function getRecordingDurationMinutes (detections: DetectionByVersionSiteSpeciesHour[]): number {
  const detectionBySiteHour = Object.values(groupBy(detections, d => `${d.timePrecisionHourLocal.getTime()}-${d.projectSiteId}`))
  return sum(detectionBySiteHour.map(speciesSummaries => speciesSummaries[0].detectionMinutes))
}

export function calculateDetectionCount (detections: DetectionByVersionSiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

function calculateDetectionFrequency (detections: DetectionByVersionSiteSpeciesHour[], totalRecordingCount: number): number {
  const detectionCount = calculateDetectionCount(detections)
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

export function calculateOccupancy (totalSiteCount: number, occupiedSites: number): number {
  return occupiedSites === 0 ? 0 : occupiedSites / totalSiteCount
}

export const getDetectionsBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewDetectionDataBySite[]> => {
  // Filter inner query by dataset filter
  const { conditions: datasetConditions, bind } = datasetFilterWhereRaw(filter)

  // Filter outer query by project & site
  // Note: all `bind` values already defined by dataset filter
  const outerConditions = ['ps.project_id = $projectId']
  if (filter.siteIds.length > 0) { outerConditions.push('ps.id = ANY($siteIds)') }

  const sql = `
    SELECT id                                 as "siteId",
          name                                as "siteName",
          latitude,
          longitude,
          detection,
          detection::float / duration_minutes as "detectionFrequency",
          detection > 0                       as occupancy
    FROM (
        SELECT ps.id,
              ps.name,
              ps.latitude,
              ps.longitude,
              coalesce(sum(detection_by_site_hour.count), 0)::integer   as detection,
              coalesce(sum(detection_by_site_hour.duration_minutes), 1) as duration_minutes
        FROM project_site as ps
        LEFT JOIN (
            SELECT time_precision_hour_local,
                  project_site_id,
                  sum(count)            as count,
                  max(detection_minutes) as duration_minutes -- same recording
            FROM detection_by_source_site_species_hour dbssh
            WHERE ${datasetConditions}
            GROUP BY dbssh.time_precision_hour_local, dbssh.project_site_id
        ) as detection_by_site_hour
            ON ps.id = detection_by_site_hour.project_site_id
        WHERE ${outerConditions.join(' AND ')}
        GROUP BY ps.id
    ) detection_by_site
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewDetectionDataBySite[]
}

export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionBySiteSpeciesHour[], isProjectMember: boolean, projectId: number): Promise<ActivityOverviewDataBySpecies[]> {
  const totalRecordingCount = getRecordingDurationMinutes(detections)
  let filteredDetections = detections

  // Filter the protected species out if the user don't have permission to protect the location when user filtering by site
  if (!isProjectMember) {
    const protectedSpecies = await models.SpeciesInProject.findAll({
      where: { projectId, riskRatingId: RISK_RATING_PROTECTED_IDS }, // TODO: Add `is_protected` column in the DB
      raw: true
    })

    filteredDetections = detections.filter(({ taxonSpeciesId }) => !protectedSpecies.find(s => s.taxonSpeciesId === taxonSpeciesId))
  }

  if (filterDetecions.length === 0) return []

  const detectionsBySpecies = groupBy(filteredDetections, 'taxonSpeciesId')
  const totalSiteCount = new Set(filteredDetections.map(({ projectSiteId }) => projectSiteId)).size

  // TODO ???: Move query to somewhere more global
  const taxonClasses = await models.TaxonClass.findAll({ raw: true })

  const speciesIds = Object.keys(detectionsBySpecies)
  const species = await models.SpeciesInProject.findAll({
    where: { taxonSpeciesId: speciesIds },
    raw: true
  })

  const activityOverviewDataBySpecies: ActivityOverviewDataBySpecies[] = []
  for (const [speciesId, speciesDetectedDetections] of Object.entries(detectionsBySpecies)) {
    const detectionCount = calculateDetectionCount(speciesDetectedDetections)
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordingCount)
    const occupiedSites = new Set(speciesDetectedDetections.map(({ projectSiteId }) => projectSiteId)).size
    const occupancyNaive = calculateOccupancy(totalSiteCount, occupiedSites)

    const matchedSpecies = species.find(({ taxonSpeciesId }) => taxonSpeciesId === Number(speciesId))

    activityOverviewDataBySpecies.push({
      commonName: matchedSpecies?.commonName ?? '',
      scientificName: matchedSpecies?.scientificName ?? '',
      taxon: taxonClasses.find(({ slug }) => matchedSpecies?.taxonClassSlug === slug)?.commonName ?? '',
      detectionCount,
      detectionFrequency,
      occupiedSites,
      occupancyNaive
    })
  }

  return activityOverviewDataBySpecies
}

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}
