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

type ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency = Omit<ActivityOverviewDetectionDataBySite, 'detectionFrequency'>

export async function filterDetections (models: AllModels, filter: FilterDatasetForSql): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(d => d.count))
}

export function getTotalRecordedMinutes (recordingsBySite: ActivityOverviewRecordingDataBySite[]): number {
  return sum(recordingsBySite.map(r => r.count))
}

function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): number {
  const totalDetectionMinutes = calculateDetectionCount(detections)
  return totalDetectionMinutes === 0 ? 0 : totalDetectionMinutes / totalRecordedMinutes
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
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT ls.id as "siteId",
      ls.name as "siteName",
      ls.latitude,
      ls.longitude,
      coalesce(sum(dbssh.count), 0)::integer as count
    FROM location_site ls LEFT JOIN detection_by_site_species_hour dbssh ON ls.id = dbssh.location_site_id
    WHERE ${conditions}
    GROUP BY 1;
  `

  const results = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as Array<Omit<ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency, 'occupancy'>>
  return results.map(r => ({ ...r, occupancy: r.count > 0 }))
}

/**
 * Gets recordings by site based on input params
 * @param {number} filters.locationProjectId
 * @param {string} filters.startDateUtcInclusive
 * @param {string} filters.endDateUtcExclusive
 * @param {number[]} filters.siteIds
 * @returns {ActivityOverviewRecordingDataBySite[]} total recording duration in minutes grouped by sites
 */
export const getTotalRecordingsBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<ActivityOverviewRecordingDataBySite[]> => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds } = filter

  const conditions = [
    'rbsh.location_project_id = $locationProjectId',
    'rbsh.time_precision_hour_local >= $startDateUtcInclusive',
    'rbsh.time_precision_hour_local < $endDateUtcExclusive'
  ]
  if (filter.siteIds.length > 0) { conditions.push('rbsh.location_site_id = ANY($siteIds)') }

  const sql = `
    SELECT rbsh.location_site_id as "siteId",
    sum(rbsh.count)::integer as count
    FROM recording_by_site_hour rbsh
    WHERE ${conditions.join(' AND ')}
    GROUP BY 1;
  `

  const bind: BindOrReplacements = {
    locationProjectId,
    startDateUtcInclusive,
    endDateUtcExclusive,
    siteIds
  }

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewRecordingDataBySite[]
}

export function combineDetectionsAndRecordings (detections: ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency[], recordings: ActivityOverviewRecordingDataBySite[]): ActivityOverviewDetectionDataBySite[] {
  const recordingsMap = Object.fromEntries(recordings.map(r => [r.siteId, r.count]))
  return detections.map(detection => ({
    ...detection,
    detectionFrequency: recordingsMap[detection.siteId] ? detection.count / recordingsMap[detection.siteId] : 0
  }))
}

export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number, isProjectMember: boolean, locationProjectId: number): Promise<ActivityOverviewDataBySpecies[]> {
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
    const detectionMinutesCount = calculateDetectionCount(speciesDetectedDetections)
    // Frequency detection for specific species
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordedMinutes)
    const occupiedSites = new Set(speciesDetectedDetections.map(({ locationSiteId }) => locationSiteId)).size
    const occupancyNaive = calculateOccupancy(totalSiteCount, occupiedSites)

    const matchedSpecies = species.find(({ taxonSpeciesId }) => taxonSpeciesId === Number(speciesId))

    activityOverviewDataBySpecies.push({
      commonName: matchedSpecies?.commonName ?? '',
      scientificName: matchedSpecies?.scientificName ?? '',
      taxon: taxonClasses.find(({ slug }) => matchedSpecies?.taxonClassSlug === slug)?.commonName ?? '',
      detectionMinutesCount,
      detectionFrequency,
      occupiedSites,
      occupancyNaive
    })
  }

  return activityOverviewDataBySpecies
}

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}
