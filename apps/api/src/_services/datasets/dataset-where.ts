import { BindOrReplacements, Op } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { dayjs } from '../dayjs-initialized'
import { FilterDataset } from './dataset-types'

export interface Condition {
  conditions: string
  bind: BindOrReplacements
}

export interface FilterDatasetForSql extends Record<string, unknown> {
  locationProjectId: number
  dateStartUtcInclusive: string
  dateEndUtcExclusive: string
  siteIds: number[]
  taxons: number[]
}

export const toFilterDatasetForSql = ({ dateEndUtcInclusive, ...rest }: FilterDataset): FilterDatasetForSql =>
  ({
    ...rest,
    dateEndUtcExclusive: dayjs.utc(dateEndUtcInclusive).add(1, 'day').toISOString()
  })

export const datasetFilterWhereRaw = (filter: FilterDatasetForSql): Condition => {
  const { locationProjectId, dateStartUtcInclusive, dateEndUtcExclusive, siteIds, taxons } = filter
  const conditions = [
    'dbssh.location_project_id = $locationProjectId', // dbssh is from detection_by_site_species_hour
    'dbssh.time_precision_hour_local >= $dateStartUtcInclusive',
    'dbssh.time_precision_hour_local < $dateEndUtcExclusive'
  ]
  const bind: BindOrReplacements = {
    locationProjectId,
    dateStartUtcInclusive,
    dateEndUtcExclusive
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
  const { locationProjectId, dateStartUtcInclusive, dateEndUtcExclusive, siteIds, taxons } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: dateStartUtcInclusive,
        [Op.lt]: dateEndUtcExclusive
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

export const whereInDatasetTimeLocation = (filter: FilterDatasetForSql): Where<DetectionBySiteSpeciesHour> => {
  const { locationProjectId, dateStartUtcInclusive, dateEndUtcExclusive, siteIds } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: dateStartUtcInclusive,
        [Op.lt]: dateEndUtcExclusive
      }
    },
    locationProjectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  return where
}
