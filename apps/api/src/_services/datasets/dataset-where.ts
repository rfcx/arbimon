import { Op } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { dayjs } from '../dayjs-initialized'
import { FilterDataset } from './dataset-types'

export interface FilterDatasetForSql extends Record<string, unknown> { // to be compatible with Sequelize `replacements` (query params)
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

// TODO: 640 Fix IN of `array` values
export const datasetFilterWhereRaw = `
  location_project_id = :locationProjectId
  AND time_precision_hour_local >= :startDateUtcInclusive
  AND time_precision_hour_local < :endDateUtcExclusive
  AND ( :siteIds IS NULL OR location_site_id IN :siteIds ) -- WRONG
  AND ( :taxons IS NULL OR taxon_class_id IN :taxons ) -- WRONG
`

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

export const whereInDatasetTimeLocation = (filter: FilterDatasetForSql): Where<DetectionBySiteSpeciesHour> => {
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
