import { groupBy, mapValues, sum } from 'lodash-es'
import { Op, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { RISK_RATING_PROTECTED_ID } from '@rfcx-bio/common/dao/master-data'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionByVersionSiteSpeciesHour, RecordingByVersionSiteHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { dayjs } from '../_services/dayjs-initialized'

type ActivityOverviewDetectionDataBySiteRowSql = Omit<ActivityOverviewDetectionDataBySite, 'countRecordingMinutes' | 'countDetectionMinutes'> & {
  count_recording_minutes: number
  count_detection_minutes: number
}

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

async function filterRecordings (models: AllModels, projectId: number, filter: FilterDataset): Promise<RecordingByVersionSiteHour[]> {
  const where: Where<RecordingByVersionSiteHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: filter.startDateUtcInclusive,
        [Op.lt]: filter.endDateUtcInclusive
      }
    },
    projectId
  }

  if (filter.siteIds.length > 0) {
    where.projectSiteId = filter.siteIds
  }

  return await models.RecordingByVersionSiteHour.findAll({
    where,
    raw: true
  })
}

export async function getRecordingDurationMinutes (models: AllModels, projectId: number, filter: FilterDataset): Promise<number> {
  const recordings = await filterRecordings(models, projectId, filter)
  return sum(recordings.map(recording => recording.countRecordingMinutes))
}

export function calculateDetectionCount (detections: DetectionByVersionSiteSpeciesHour[]): number {
  return sum(detections.map(({ countDetectionMinutes }) => countDetectionMinutes))
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
  const outerConditions = ['site.project_version_first_appears_id = $projectVersionId']
  if (filter.siteIds.length > 0) { outerConditions.push('site.id = ANY($siteIds)') }
  // TODO: update logic for WHERE conditions
  const sql = `
    WITH recording AS (
      SELECT rvsh.project_version_id,
        rvsh.project_site_id,
        rvsh.time_precision_hour_local,
        rvsh.count_recording_minutes
      FROM recording_by_version_site_hour rvsh
    ),
    detection AS (
      SELECT dbvssh.project_version_id,
        dbvssh.project_site_id,
        dbvssh.time_precision_hour_local,
        sum(count_detection_minutes) AS count_detection_minutes_all_species
      FROM detection_by_version_site_species_hour dbvssh
      GROUP BY dbvssh.project_version_id, dbvssh.project_site_id, dbvssh.time_precision_hour_local)

    SELECT data.project_site_id,
      site.latitude,
      site.longitude,
      data.count_recording_minutes,
      data.count_detection_minutes,
      data.count_detection_minutes > 0 AS occupancy,
      data.count_detection_minutes::float / data.count_recording_minutes AS detection_frequency
    FROM project_site site
    JOIN (SELECT recording.project_site_id,
      sum(recording.count_recording_minutes) AS count_recording_minutes,
      coalesce(sum(detection.count_detection_minutes_all_species)::integer, 0) AS count_detection_minutes
    FROM recording
    LEFT JOIN detection
      ON recording.project_version_id = detection.project_version_id
        AND recording.project_site_id = detection.project_site_id
        AND recording.time_precision_hour_local = detection.time_precision_hour_local
      GROUP BY recording.project_site_id) data
      ON site.id = data.project_site_id
    WHERE ${outerConditions.join(' AND ')}
  `
  return await sequelize.query<ActivityOverviewDetectionDataBySiteRowSql>(sql, { type: QueryTypes.SELECT, bind, raw: true })
    .then(res => res.map(({ count_recording_minutes: countRecordingMinutes, count_detection_minutes: countDetectionMinutes, ...rest }) =>
      ({ countRecordingMinutes, countDetectionMinutes, ...rest })
    ))
}
// TODO: fix logic in getDetectionDataBySpecies
export async function getDetectionDataBySpecies (models: AllModels, detections: DetectionByVersionSiteSpeciesHour[], isProjectMember: boolean, projectId: number, filter: FilterDataset): Promise<ActivityOverviewDataBySpecies[]> {
  const totalRecordingCount = await getRecordingDurationMinutes(models, projectId, filter)
  let filteredDetections = detections

  // Filter the protected species out if the user don't have permission to protect the location when user filtering by site
  if (!isProjectMember) {
    const protectedSpecies = await models.SpeciesInProject.findAll({
      where: { projectId, riskRatingId: RISK_RATING_PROTECTED_ID }, // TODO: Add `is_protected` column in the DB
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

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionByVersionSiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionByVersionSiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionByVersionSiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionByVersionSiteSpeciesHour[], totalRecordingCount: number): ActivityOverviewDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}
