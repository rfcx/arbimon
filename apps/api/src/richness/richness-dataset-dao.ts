import { keyBy, mapValues } from 'lodash-es'
import { Op, QueryTypes, Sequelize } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Site, TaxonClass } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { datasetFilterWhereRaw, FilterDatasetForSql, whereInDataset } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '../_services/security/protected-species'

export const getRichnessByTaxonClass = async (models: AllModels, sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const result = await models
    .DetectionBySiteSpeciesHour
    .findAll({
      attributes: ['taxonClassId', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))::integer'), 'richness']],
      where: whereInDataset(filter),
      group: 'taxonClassId',
      raw: true
    }) as unknown as Array<{ taxonClassId: number, richness: number }>

  return Object.fromEntries(result.map(r => [r.taxonClassId, r.richness]))
}

export const getRichnessBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<SpeciesCountBySite[]> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT 
      species_group.location_site_id as "locationSiteId",
      species_group.taxon_class_id as "taxonClassId",
      COUNT(DISTINCT species_group.taxon_species_id)::integer as "richness"
    FROM (
      SELECT location_site_id, taxon_class_id, taxon_species_id
      FROM detection_by_site_species_hour
      WHERE ${conditions}
      GROUP BY location_site_id, taxon_class_id, taxon_species_id
    ) species_group
    GROUP BY species_group.location_site_id, species_group.taxon_class_id
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as SpeciesCountBySite[]
}

type TimeSeries = 'hour' | 'dow' | 'month'

export const getSpeciesByTimeSeries = async (sequelize: Sequelize, filter: FilterDatasetForSql, timeSeries: TimeSeries): Promise<Record<number, number>> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const seriesEnd = (t: TimeSeries): number => {
    switch (t) {
      case 'dow': return 6
      case 'month': return 11
      default: return 23
    }
  }

  const sql = `
    SELECT gs.gs as grouped_time_bucket, COALESCE(data.richness, 0) as richness
    FROM generate_series(0, ${seriesEnd(timeSeries)}) gs
      LEFT JOIN (
      SELECT extract(${timeSeries} FROM time_precision_hour_local) as grouped_time_bucket,
             Count(distinct taxon_species_id)                      as richness
      FROM detection_by_site_species_hour dbssh
      WHERE ${conditions}
      GROUP BY grouped_time_bucket
    ) as data
    ON gs.gs = data.grouped_time_bucket
    ORDER BY gs.gs
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return mapValues(keyBy(result, 'grouped_time_bucket'), 'richness')
}

export const getSpeciesByTimeHourOfDay = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getSpeciesByTimeSeries(sequelize, filter, 'hour')
}

export const getSpeciesByTimeDayOfWeek = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getSpeciesByTimeSeries(sequelize, filter, 'dow')
}

export const getSpeciesByTimeMonthOfYear = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getSpeciesByTimeSeries(sequelize, filter, 'month')
}

export const getSpeciesByTimeUnix = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT extract(epoch FROM date_group.date) as date_unix, date_group.richness
    FROM (
      SELECT DATE(time_precision_hour_local)  as date,
             Count(distinct taxon_species_id) as richness
      FROM detection_by_site_species_hour dbssh
      WHERE ${conditions}
      GROUP BY DATE(time_precision_hour_local)
    ) as date_group
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return mapValues(keyBy(result, 'date_unix'), 'richness')
}

export const getSitesByProjectId = async (models: AllModels, locationProjectId: number): Promise<Site[]> => {
  return await models.LocationSite.findAll({ where: { locationProjectId }, raw: true })
}

export const getTaxonClasses = async (models: AllModels): Promise<TaxonClass[]> => {
  return await models.TaxonClass.findAll({ raw: true })
}

// TODO 640: Move with `getSpeciesBySite()`
export interface SpeciesCountBySite {
  locationSiteId: number
  taxonClassId: number
  richness: number
}

export interface DetectionGroupByTaxonSpeciesId {
  taxonSpeciesId: number
}

export const getDetectionGroupByTaxonSpeciesIds = async (models: AllModels, locationProjectId: number, filter: FilterDatasetForSql): Promise<DetectionGroupByTaxonSpeciesId[]> => {
  return await models.DetectionBySiteSpeciesHour.findAll({
    attributes: ['taxonSpeciesId'],
    where: whereInDataset(filter),
    group: 'taxonSpeciesId',
    raw: true
  })
}

export const getSpeciesInProject = async (models: AllModels, locationProjectId: number, hasProjectPermission: boolean, presenceSpeciesIds?: number[]): Promise<SpeciesInProject[]> => {
  const where: Where<SpeciesInProject> = {
    locationProjectId: locationProjectId
  }

  if (presenceSpeciesIds && presenceSpeciesIds.length > 0) {
    where.taxonSpeciesId = presenceSpeciesIds
  }

  if (!hasProjectPermission) {
    where.riskRatingId = {
      [Op.notIn]: RISK_RATING_PROTECTED_IDS
    }
  }

  return await models.SpeciesInProject.findAll({
    where,
    raw: true
  })
}
