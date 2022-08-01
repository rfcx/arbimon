import { groupBy, mapValues, sum } from 'lodash-es'
import { BindOrReplacements, Op, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime, ActivityOverviewRecordingDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { dayjs } from '../_services/dayjs-initialized'

// Similar logic with filterDetection in `controller-spotlight-dataset.ts`. Moving to common?
export async function filterDetecions (models: AllModels, projectId: number, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = getRecordingBySiteHourWhereRaw(projectId, filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export function getRecordingBySiteHourWhereRaw (projectId: number, filter: FilterDataset): Where<DetectionBySiteSpeciesHour> {
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
  return where
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

export function getRecordingTotalDurationMinutes (recordingsBySite: ActivityOverviewRecordingDataBySite[]): number {
  return sum(recordingsBySite.map(({ totalRecordingMinutes }) => totalRecordingMinutes))
}

function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): number {
  const detectionCount = calculateDetectionCount(detections)
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingDuration
}

export function calculateOccupancy (totalSiteCount: number, occupiedSites: number): number {
  return occupiedSites === 0 ? 0 : occupiedSites / totalSiteCount
}

/**
 * Gets detection by site based on input params
 * @param {number} filters.locationProjectId
 * @param {string} filters.startDateUtcInclusive
 * @param {string} filters.endDateUtcExclusive
 * @param {number[]} filters.siteIds
 * @returns {ActivityOverviewDetectionDataBySite[]} total detections count grouped by sites + site data (id, name, lat, long)
 */
export const getDetectionsBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewDetectionDataBySite[]> => {
  // Filter inner query by dataset filter
  const { conditions: datasetConditions, bind } = datasetFilterWhereRaw(filter)

  // Filter outer query by project & site
  // Note: all `bind` values already defined by dataset filter
  const outerConditions = ['ls.location_project_id = $locationProjectId']
  if (filter.siteIds.length > 0) { outerConditions.push('ls.id = ANY($siteIds)') }

  const sql = `
    SELECT id as "siteId",
        name as "siteName",
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

/**
 * Gets recordingsa by site based on input params
 * @param {number} filters.locationProjectId
 * @param {string} filters.startDateUtcInclusive
 * @param {string} filters.endDateUtcExclusive
 * @param {number[]} filters.siteIds
 * @returns {ActivityOverviewRecordingDataBySite[]} total recording duration in minutes grouped by sites
 */
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
    SELECT id as "siteId",
        name as "siteName",
        duration_minutes as "totalRecordingMinutes"
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

export function getDetectionFrequencyBySite (detectionBySite: ActivityOverviewDetectionDataBySite, allRecordings: ActivityOverviewRecordingDataBySite[]): number {
  const recordingsBySite = allRecordings.find(rec => rec.siteId === detectionBySite.siteId)
  return recordingsBySite?.totalRecordingMinutes !== undefined ? detectionBySite.detection / recordingsBySite.totalRecordingMinutes : 0
}

export function parseDetectionsBySite (detections: ActivityOverviewDetectionDataBySite[], recordings: ActivityOverviewRecordingDataBySite[]): ActivityOverviewDetectionDataBySite[] {
  const parsedDetections = detections.map(det => ({
    ...det,
    detectionFrequency: getDetectionFrequencyBySite(det, recordings)
  }))
  return parsedDetections
}

export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number, isProjectMember: boolean, locationProjectId: number): Promise<ActivityOverviewDataBySpecies[]> {
  // const totalRecordingDuration = await getRecordingDurationMinutes(models, detections)
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
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordingDuration)
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

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingDuration))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingDuration))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingDuration))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingDuration))
  }
}
