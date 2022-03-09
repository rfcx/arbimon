import { Op } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'

export interface FilterDataset {
  startDateUtcInclusive: string
  endDateUtcInclusive: string
  siteIds: number[]
  taxons: string[]
}

export interface FilterDatasetForSql {
  startDateUtcInclusive: string
  endDateUtcExclusive: string
  siteIds: number[]
  taxons: string[]
}

export const datasetFilterWhereRaw = `
  location_project_id = :locationProjectId
  AND time_precision_hour_local >= :startDate
  AND time_precision_hour_local < :endDate
  AND ( :siteIds IS NULL OR location_site_id IN :siteIds )
  AND ( :taxons IS NULL OR taxon_class_id IN :taxon )
`

export const whereInDataset = (locationProjectId: number, filter: FilterDataset): Where<DetectionBySiteSpeciesHour> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive // Wrong: Should be Op.lt: endDateUtcExclusive (ie. inclusive + 1)
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

export const whereInDatasetTimeLocation = (locationProjectId: number, filter: FilterDataset): Where<DetectionBySiteSpeciesHour> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive // Wrong: Should be Op.lt: endDateUtcExclusive (ie. inclusive + 1)
      }
    },
    locationProjectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  return where
}
