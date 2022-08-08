import { groupBy, mapValues, sum } from 'lodash-es'
import { BindOrReplacements, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime, ActivityOverviewRecordingDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { datasetFilterWhereRaw, FilterDatasetForSql, whereInDataset } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'
import { dayjs } from '../_services/dayjs-initialized'

export type ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency = Omit<ActivityOverviewDetectionDataBySite, 'detectionFrequency'>

export async function filterDetections (models: AllModels, filter: FilterDatasetForSql): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

export function getRecordingTotalDurationMinutes (recordingsBySite: ActivityOverviewRecordingDataBySite[]): number {
  return sum(recordingsBySite.map(({ totalRecordingMinutes }) => totalRecordingMinutes))
}

function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordingDuration: number): number {
  const totalDetectionsMinutes = sum(detections.map(({ durationMinutes }) => durationMinutes))
  return totalDetectionsMinutes === 0 ? 0 : totalDetectionsMinutes / totalRecordingDuration
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
export const getDetectionBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency[]> => {
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
        total_detection_count as "totalDetectionCount",
        total_detection_minutes as "totalDetectionMinutes",
        total_detection_count > 0 occupancy
    FROM (
        SELECT ls.id,
            ls.name,
            ls.latitude,
            ls.longitude,
            coalesce(sum(detection_by_site_hour.count), 0)::integer as total_detection_count,
            coalesce(sum(detection_by_site_hour.duration_minutes), 0)::integer as total_detection_minutes
        FROM location_site as ls
        LEFT JOIN (
            SELECT time_precision_hour_local,
                location_site_id,
                sum(count) as count,
                sum(duration_minutes) as duration_minutes
            FROM detection_by_site_species_hour dbssh
            WHERE ${datasetConditions}
            GROUP BY dbssh.time_precision_hour_local, dbssh.location_site_id
        ) as detection_by_site_hour
            ON ls.id = detection_by_site_hour.location_site_id
        WHERE ${outerConditions.join(' AND ')}
        GROUP BY ls.id
    ) detection_by_site
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency[]
}

/**
 * Gets recordingsa by site based on input params
 * @param {number} filters.locationProjectId
 * @param {string} filters.startDateUtcInclusive
 * @param {string} filters.endDateUtcExclusive
 * @param {number[]} filters.siteIds
 * @returns {ActivityOverviewRecordingDataBySite[]} total recording duration in minutes grouped by sites
 */
export const getRecordingBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewRecordingDataBySite[]> => {
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

export function getDetectionFrequencyBySite (detectionData: ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency, allRecordings: ActivityOverviewRecordingDataBySite[]): number {
  const recordingsBySite = allRecordings.find(rec => rec.siteId === detectionData.siteId)
  return recordingsBySite?.totalRecordingMinutes === undefined ? 0 : detectionData.totalDetectionMinutes / recordingsBySite.totalRecordingMinutes
}

export function parseDetectionsBySite (detections: ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency[], recordings: ActivityOverviewRecordingDataBySite[]): ActivityOverviewDetectionDataBySite[] {
  return detections.map(detection => ({
    ...detection,
    detectionFrequency: getDetectionFrequencyBySite(detection, recordings)
  }))
}

export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionBySiteSpeciesHour[], totalRecordingMinutes: number, isProjectMember: boolean, locationProjectId: number): Promise<ActivityOverviewDataBySpecies[]> {
  let filteredDetections = detections

  // Filter the protected species out if the user don't have permission to protect the location when user filtering by site
  if (!isProjectMember) {
    const protectedSpecies = await models.SpeciesInProject.findAll({
      where: { locationProjectId, riskRatingId: RISK_RATING_PROTECTED_IDS }, // TODO: Add `is_protected` column in the DB
      raw: true
    })

    filteredDetections = detections.filter(({ taxonSpeciesId }) => !protectedSpecies.find(s => s.taxonSpeciesId === taxonSpeciesId))
  }

  if (filterDetections.length === 0) return []

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
    // Frequency detection for specific species
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordingMinutes)
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

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationMinutes: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingDurationMinutes))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationMinutes: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingDurationMinutes))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationMinutes: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingDurationMinutes))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingDurationMinutes: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingDurationMinutes))
  }
}
