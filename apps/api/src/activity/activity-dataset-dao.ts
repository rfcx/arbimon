import { groupBy, mapValues, sum } from 'lodash-es'
import { BindOrReplacements, Op, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime, ActivityOverviewRecordingDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour, RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { dayjs } from '../_services/dayjs-initialized'

// Similar logic with filterDetection in `controller-spotlight-dataset.ts`. Moving to common?
export async function filterDetecions (models: AllModels, projectId: number, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    },
    locationProjectId: projectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  // ! Be careful
  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function getRecordingDurationMinutes (models: AllModels, detections: DetectionBySiteSpeciesHour[]): Promise<number> {
  // group detections by date and site
  const detectionBySiteHour = Object.values(groupBy(detections, d => `${d.timePrecisionHourLocal.getTime()}-${d.locationSiteId}`))
  let totalMinutes = 0
  for (const group of detectionBySiteHour) {
    // find recording group related to date and site
    const bioRecordingBySiteHour = await models.RecordingBySiteHour.findOne({
      where: {
        timePrecisionHourLocal: group[0].timePrecisionHourLocal,
        locationSiteId: group[0].locationSiteId
      },
      raw: true
    }) as unknown as RecordingBySiteHour

    totalMinutes = totalMinutes + (bioRecordingBySiteHour?.totalDurationInMinutes !== undefined
      ? bioRecordingBySiteHour.totalDurationInMinutes
      : sum(group.map(g => g.durationMinutes)))
  }
  return totalMinutes
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordingDurationCount: number): number {
  const detectionCount = calculateDetectionCount(detections)
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingDurationCount
}

export function calculateOccupancy (totalSiteCount: number, occupiedSites: number): number {
  return occupiedSites === 0 ? 0 : occupiedSites / totalSiteCount
}

export const getDetectionsBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewDetectionDataBySite[]> => {
  // Filter inner query by dataset filter
  const { conditions: datasetConditions, bind } = datasetFilterWhereRaw(filter)

  // Filter outer query by project & site
  // Note: all `bind` values already defined by dataset filter
  const outerConditions = ['ls.location_project_id = $locationProjectId']
  if (filter.siteIds.length > 0) { outerConditions.push('ls.id = ANY($siteIds)') }

  const sql = `
    SELECT id siteId,
        name siteName,
        latitude,
        longitude,
        detection,
        detection > 0 occupancy
    FROM (
        SELECT ls.id,
            ls.name,
            ls.latitude,
            ls.longitude,
            coalesce(sum(detection_by_site_hour.count), 0)::integer as detection
        FROM location_site as ls
        LEFT JOIN (
            SELECT time_precision_hour_local,
                location_site_id,
                sum(count) as count
            FROM detection_by_site_species_hour dbssh
            WHERE ${datasetConditions}
            GROUP BY dbssh.time_precision_hour_local, dbssh.location_site_id
        ) as detection_by_site_hour
            ON ls.id = detection_by_site_hour.location_site_id
        WHERE ${outerConditions.join(' AND ')}
        GROUP BY ls.id
    ) detection_by_site
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewDetectionDataBySite[]
}

export const getRecordingsBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewRecordingDataBySite[]> => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds } = filter

  // Filter inner query by dataset filter
  const datasetConditions = [
    'location_project_id = $locationProjectId',
    'time_precision_hour_local >= $startDateUtcInclusive',
    'time_precision_hour_local < $endDateUtcExclusive'
  ]
  if (filter.siteIds.length > 0) { datasetConditions.push('location_site_id = ANY($siteIds)') }

  // Filter outer query by project & site
  const outerConditions = ['ls.location_project_id = $locationProjectId']
  if (filter.siteIds.length > 0) { outerConditions.push('ls.id = ANY($siteIds)') }

  const sql = `
    SELECT id siteId,
        name siteName,
        duration_minutes
    FROM (
      SELECT ls.id,
          ls.name,
          sum(rbsh.total_duration_in_minutes) as duration_minutes
    FROM location_site as ls
    JOIN (
        SELECT time_precision_hour_local,
            location_site_id,
            total_duration_in_minutes
        FROM recording_by_site_hour
        WHERE ${datasetConditions.join(' AND ')}
        GROUP BY time_precision_hour_local, location_site_id, total_duration_in_minutes
    ) as rbsh
        ON ls.id = rbsh.location_site_id
        WHERE ${outerConditions.join(' AND ')}
        GROUP BY ls.id
    ) recording_by_site
  ;
  `

  const bind: BindOrReplacements = {
    locationProjectId,
    startDateUtcInclusive,
    endDateUtcExclusive,
    siteIds
  }

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewRecordingDataBySite[]
}

export function getDetectionFrequency (detection: ActivityOverviewDetectionDataBySite, recordings: ActivityOverviewRecordingDataBySite[]): number {
  const recording = recordings.find(rec => rec.siteId === detection.siteId)
  const freq = detection.detection / (recording?.duration_minutes ?? 0)
  return freq
}

export function parseDetectionsBySite (detections: ActivityOverviewDetectionDataBySite[], recordings: ActivityOverviewRecordingDataBySite[]): ActivityOverviewDetectionDataBySite[] {
  const parsedDetections = detections.map(det => ({
    ...det,
    detectionFrequency: getDetectionFrequency(det, recordings)
  }))
  return parsedDetections
}

export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionBySiteSpeciesHour[], isProjectMember: boolean, locationProjectId: number): Promise<ActivityOverviewDataBySpecies[]> {
  const totalRecordingDurationCount = await getRecordingDurationMinutes(models, detections)
  let filteredDetections = detections

  // Filter the protected species out if the user don't have permission to protect the location when user filtering by site
  if (!isProjectMember) {
    const protectedSpecies = await models.SpeciesInProject.findAll({
      where: { locationProjectId, riskRatingId: RISK_RATING_PROTECTED_IDS }, // TODO: Add `is_protected` column in the DB
      raw: true
    })

    filteredDetections = detections.filter(({ taxonSpeciesId }) => !protectedSpecies.find(s => s.taxonSpeciesId === taxonSpeciesId))
  }

  if (filterDetecions.length === 0) return []

  const detectionsBySpecies = groupBy(filteredDetections, 'taxonSpeciesId')
  const totalSiteCount = new Set(filteredDetections.map(({ locationSiteId }) => locationSiteId)).size

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
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordingDurationCount)
    const occupiedSites = new Set(speciesDetectedDetections.map(({ locationSiteId }) => locationSiteId)).size
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

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationCount: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingDurationCount))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationCount: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingDurationCount))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationCount: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingDurationCount))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationCount: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingDurationCount))
  }
}
