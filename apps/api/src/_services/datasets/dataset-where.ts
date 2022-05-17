import { BindOrReplacements, Op } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionByVersionSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { dayjs } from '../dayjs-initialized'
import { FilterDataset } from './dataset-types'

export interface Condition {
  conditions: string
  bind: BindOrReplacements
}

export interface FilterDatasetForSql extends Record<string, unknown> {
  projectVersionId: number
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
  const { projectVersionId, startDateUtcInclusive, endDateUtcExclusive, siteIds, taxons } = filter
  const conditions = [
    'dbvssh.project_version_id = $projectVersionId', // dbvssh is from detection_by_site_species_hour
    'dbvssh.time_precision_hour_local >= $startDateUtcInclusive',
    'dbvssh.time_precision_hour_local < $endDateUtcExclusive'
  ]
  const bind: BindOrReplacements = {
    projectVersionId,
    startDateUtcInclusive,
    endDateUtcExclusive
  }

  if (siteIds.length > 0) {
    conditions.push('dbvssh.project_site_id = ANY($siteIds)')
    bind.siteIds = siteIds
  }

  if (taxons.length > 0) {
    conditions.push('dbvssh.taxon_class_id = ANY($taxons)')
    bind.taxons = taxons
  }

  return { conditions: conditions.join(' AND '), bind }
}

export const whereInDataset = (filter: FilterDatasetForSql): Where<DetectionByVersionSiteSpeciesHour> => {
  const { projectVersionId, startDateUtcInclusive, endDateUtcExclusive, siteIds, taxons } = filter

  const where: Where<DetectionByVersionSiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcExclusive
      }
    },
    projectVersionId
  }

  if (siteIds.length > 0) {
    where.projectSiteId = siteIds
  }

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  return where
}

export const whereInDatasetTimeLocation = (filter: FilterDatasetForSql): Where<DetectionByVersionSiteSpeciesHour> => {
  const { projectVersionId, startDateUtcInclusive, endDateUtcExclusive, siteIds } = filter

  const where: Where<DetectionByVersionSiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcExclusive
      }
    },
    projectVersionId
  }

  if (siteIds.length > 0) {
    where.projectSiteId = siteIds
  }

  return where
}
