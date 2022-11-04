import { sum } from 'lodash-es'
import { BindOrReplacements, QueryTypes, Sequelize } from 'sequelize'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime, ActivityOverviewRecordingDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { toPrecisionNumber } from '@rfcx-bio/utils/number'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'

type ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency = Omit<ActivityOverviewDetectionDataBySite, 'detectionFrequency'>

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(d => d.count))
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

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewDetectionDataBySiteWithoutDetectionFrequency[]
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
    detectionFrequency: recordingsMap[detection.siteId] ? toPrecisionNumber(detection.count / recordingsMap[detection.siteId], 3) : 0
  }))
}

export async function getDetectionDataBySpecies (sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number, totalSiteCount: number, isProjectMember: boolean): Promise<ActivityOverviewDataBySpecies[]> {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds, taxons } = filter
  const bind: BindOrReplacements = {
    locationProjectId,
    startDateUtcInclusive,
    endDateUtcExclusive,
    siteIds,
    taxons
  }

  const conditions = [
    'location_project_id = $locationProjectId',
    'time_precision_hour_local >= $startDateUtcInclusive',
    'time_precision_hour_local < $endDateUtcExclusive'
  ]
  if (filter.siteIds.length > 0) {
    conditions.push('location_site_id = ANY($siteIds)')
  }
  if (taxons !== undefined && taxons.length > 0) {
    conditions.push('taxon_class_id = ANY($taxons)')
  }

  const speciesConditions = [
    'sip.location_project_id = $locationProjectId'
  ]
  if (!isProjectMember) {
    speciesConditions.push(`sip.risk_rating_id NOT IN (${RISK_RATING_PROTECTED_IDS.join(',')})`)
  }

  const sql = `
    SELECT sip.common_name "commonName",
      sip.scientific_name "scientificName",
      tc.common_name taxon,
      d."detectionMinutesCount",
      d."occupiedSites"
    FROM species_in_project sip
    JOIN taxon_class tc ON tc.id = sip.taxon_class_id
    JOIN (SELECT taxon_species_id,
          sum(count)::integer "detectionMinutesCount",
          count(distinct location_site_id)::integer "occupiedSites"
        FROM detection_by_site_species_hour
        WHERE ${conditions.join(' AND ')}
        GROUP BY 1
    ) d ON sip.taxon_species_id = d.taxon_species_id
    WHERE ${speciesConditions.join(' AND ')};
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ActivityOverviewDataBySpecies[]
  return result.map(r => ({
    ...r,
    detectionFrequency: toPrecisionNumber(r.detectionMinutesCount / totalRecordedMinutes, 3),
    occupancyNaive: toPrecisionNumber(r.occupiedSites / totalSiteCount, 3)
  }))
}

async function getDetectionsByPeriod (periodColumn: string, sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number): Promise<ActivityOverviewDetectionDataByTime> {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT ${periodColumn} period,
      coalesce(sum(dbssh.count), 0)::integer count
    FROM detection_by_site_species_hour dbssh
    WHERE ${conditions}
    GROUP BY 1;
  `

  const results = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as Array<{period: number, count: number}>
  return {
    detection: Object.fromEntries(results.map(r => [r.period, r.count])),
    detectionFrequency: Object.fromEntries(results.map(r => [r.period, toPrecisionNumber(r.count / totalRecordedMinutes, 3)]))
  }
}

export async function getDetectionsByTimeHour (sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number): Promise<ActivityOverviewDetectionDataByTime> {
  return await getDetectionsByPeriod('extract(hour from time_precision_hour_local)', sequelize, filter, totalRecordedMinutes)
}

export async function getDetectionsByTimeDay (sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number): Promise<ActivityOverviewDetectionDataByTime> {
  return await getDetectionsByPeriod('extract(isodow from time_precision_hour_local) - 1', sequelize, filter, totalRecordedMinutes)
}

export async function getDetectionsByTimeMonth (sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number): Promise<ActivityOverviewDetectionDataByTime> {
  return await getDetectionsByPeriod('extract(month from time_precision_hour_local) - 1', sequelize, filter, totalRecordedMinutes)
}

export async function getDetectionsByTimeDateUnix (sequelize: Sequelize, filter: FilterDatasetForSql, totalRecordedMinutes: number): Promise<ActivityOverviewDetectionDataByTime> {
  return await getDetectionsByPeriod('extract(epoch from time_precision_hour_local::date)', sequelize, filter, totalRecordedMinutes)
}
