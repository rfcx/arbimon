import { BindOrReplacements, Op } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour, RecordingBySiteHour } from '@rfcx-bio/common/dao/types'

import { dayjs } from '../dayjs-initialized'
import { FilterDataset } from './dataset-types'

export interface Condition {
  conditions: string
  bind: BindOrReplacements
}

export interface FilterDatasetForSql extends Record<string, unknown> {
  locationProjectId: number
  startDateUtcInclusive: string
  endDateUtcExclusive: string
  siteIds: number[]
  taxons: number[]
}

export const toFilterDatasetForSql = ({ endDateUtcInclusive, ...rest }: FilterDataset): FilterDatasetForSql =>
  ({
    ...rest,
    endDateUtcExclusive: dayjs.utc(endDateUtcInclusive).add(1, 'day').toISOString()
  })

export const datasetFilterWhereRaw = (filter: FilterDatasetForSql): Condition => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds, taxons } = filter
  const conditions = [
    'dbssh.location_project_id = $locationProjectId', // dbssh is from detection_by_site_species_hour
    'dbssh.time_precision_hour_local >= $startDateUtcInclusive',
    'dbssh.time_precision_hour_local < $endDateUtcExclusive'
  ]
  const bind: BindOrReplacements = {
    locationProjectId,
    startDateUtcInclusive,
    endDateUtcExclusive
  }

  if (siteIds.length > 0) {
    conditions.push('dbssh.location_site_id = ANY($siteIds)')
    bind.siteIds = siteIds
  }

  if (taxons.length > 0) {
    conditions.push('dbssh.taxon_class_id = ANY($taxons)')
    bind.taxons = taxons
  }

  return { conditions: conditions.join(' AND '), bind }
}

export const whereInDataset = (filter: FilterDatasetForSql): Where<DetectionBySiteSpeciesHour> => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds, taxons } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcExclusive
      }
    },
    locationProjectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  return where
}

export const whereInDatasetTimeLocation = (filter: FilterDatasetForSql): Where<DetectionBySiteSpeciesHour | RecordingBySiteHour> => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, siteIds } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcExclusive
      }
    },
    locationProjectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  return where
}

export function getDetectionBySiteHourWhereRaw (projectId: number, filter: FilterDataset): Where<DetectionBySiteSpeciesHour> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, speciesId, taxons } = filter

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

  if (speciesId !== undefined) {
    where.taxonSpeciesId = speciesId
  }

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }
  return where
}
