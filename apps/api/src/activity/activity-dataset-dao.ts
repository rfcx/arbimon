import { groupBy, mapValues, sum } from 'lodash-es'
import { Op } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

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
    projectId
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

export function getRecordingDurationMinutes (detections: DetectionBySiteSpeciesHour[]): number {
  const detectionBySiteHour = Object.values(groupBy(detections, d => `${d.timePrecisionHourLocal.getTime()}-${d.locationSiteId}`))
  return sum(detectionBySiteHour.map(speciesSummaries => speciesSummaries[0].durationMinutes))
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): number {
  const detectionCount = calculateDetectionCount(detections)
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

export function calculateOccupancy (totalSiteCount: number, occupiedSites: number): number {
  return occupiedSites === 0 ? 0 : occupiedSites / totalSiteCount
}

export const getDetectionDataBySite = async (models: AllModels, detections: DetectionBySiteSpeciesHour[]): Promise<ActivityOverviewDetectionDataBySite> => {
  const detectionsBySites: { [siteId: number]: DetectionBySiteSpeciesHour[] } = groupBy(detections, 'locationSiteId')
  const siteIds = Object.keys(detectionsBySites)

  // TODO ???: Move query to somewhere more global
  const sites = await models.LocationSite.findAll({
    where: { id: siteIds },
    raw: true
  })

  const summariesBySites = mapValues(detectionsBySites, (detectionsSummaries, siteIdString) => {
    const totalRecordingCount = getRecordingDurationMinutes(detectionsSummaries)

    const detectionCount = sum(detectionsSummaries.map(({ count }) => count))
    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount
    const siteOccupiedFrequency = detectionsSummaries.length > 0

    const siteId = Number(siteIdString)
    const matchedSite = sites.find(s => s.id === siteId)

    return {
      siteId,
      siteName: matchedSite?.name ?? '',
      latitude: matchedSite?.latitude ?? 0,
      longitude: matchedSite?.longitude ?? 0,
      detection: detectionCount,
      detectionFrequency: detectionFrequency,
      occupancy: siteOccupiedFrequency
    }
  })
  return summariesBySites
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
    const detectionFrequency = calculateDetectionFrequency(speciesDetectedDetections, totalRecordingCount)
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
