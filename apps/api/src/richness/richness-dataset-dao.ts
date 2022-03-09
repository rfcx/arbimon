import { fromPairs, keyBy, mapValues } from 'lodash-es'
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
  const sql = `
    SELECT 
      species_group.location_site_id as "locationSiteId",
      species_group.taxon_class_id as "taxonClassId",
      COUNT(DISTINCT species_group.taxon_species_id)::integer as "richness"
    FROM (
      SELECT location_site_id, taxon_class_id, taxon_species_id
      FROM detection_by_site_species_hour
      WHERE ${datasetFilterWhereRaw}
      GROUP BY location_site_id, taxon_class_id, taxon_species_id
    ) species_group
    GROUP BY species_group.location_site_id, species_group.taxon_class_id
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: filter, raw: true }) as unknown as SpeciesCountBySite[]
}

export const getSpeciesByTimeHourOfDay = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const sql = `
    SELECT extract(hour FROM time_precision_hour_local) as hour_of_day,
          Count(distinct taxon_species_id)              as richness
    FROM detection_by_site_species_hour dbssh
    WHERE ${datasetFilterWhereRaw}
    GROUP BY 1
    ORDER BY 1
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: filter, raw: true })

  const allHours = fromPairs(Array.from({ length: 24 }, (_, idx) => [idx, 0] as [number, number]))
  return { ...allHours, ...mapValues(keyBy(result, 'hour_of_day'), 'richness') }
}

export const getSpeciesByTimeDayOfWeek = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const sql = `
    SELECT extract(dow FROM time_precision_hour_local) as day_of_week,
          Count(distinct taxon_species_id)             as richness
    FROM detection_by_site_species_hour dbssh
    WHERE ${datasetFilterWhereRaw}
    GROUP BY 1
    ORDER BY 1
  `
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
