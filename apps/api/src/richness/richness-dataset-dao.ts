import { Op, QueryTypes, Sequelize } from 'sequelize'

import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Site, TaxonClass } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { FilterDataset } from '~/mock-helper'
import { RISK_RATING_PROTECTED_IDS } from '../_services/security/protected-species'

const detectionConditions = (locationProjectId: number, filter: FilterDataset): Where<DetectionBySiteSpeciesHour> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
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

export const getSitesByProjectId = async (models: AllModels, locationProjectId: number): Promise<Site[]> => {
  return await models.LocationSite.findAll({ where: { locationProjectId }, raw: true })
}

export const getTaxonClasses = async (models: AllModels): Promise<TaxonClass[]> => {
  return await models.TaxonClass.findAll({ raw: true })
}

export const getDetections = async (models: AllModels, locationProjectId: number, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> => {
  const where = detectionConditions(locationProjectId, filter)
  return await models.DetectionBySiteSpeciesHour.findAll({ where, raw: true })
}

// TODO 640: Move with `getSpeciesByTaxon()`
export interface DetectionsGroupByTaxonClass {
  taxonClassId: number
  speciesCount: number
}

export const getDetectionGroupByTaxonClass = async (models: AllModels, sequelize: Sequelize, locationProjectId: number, filter: FilterDataset): Promise<DetectionsGroupByTaxonClass[]> => {
  const where = detectionConditions(locationProjectId, filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    attributes: ['taxonClassId', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))::integer'), 'speciesCount']],
    where,
    group: 'taxonClassId',
    raw: true
  }) as unknown as DetectionsGroupByTaxonClass[]
}

// TODO 640: Move with `getSpeciesBySite()`
export interface SpeciesCountBySite {
  locationSiteId: number
  taxonClassId: number
  speciesCount: number
}

// TODO 640: Maybe a better way to query by sequelize
export const getSpeciesCountBySite = async (sequelize: Sequelize, projectId: number, filter: FilterDataset): Promise<SpeciesCountBySite[]> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

  const where = [`time_precision_hour_local >= '${startDateUtcInclusive}' AND time_precision_hour_local < '${endDateUtcInclusive}'`]

  if (siteIds.length > 0) {
    where.push(`location_site_id = ${JSON.stringify(siteIds)}`)
  }

  if (taxons.length > 0) {
    where.push(`taxon_class_id = ${JSON.stringify(taxons)}`)
  }

  const speciesCountBySitesSql = `
    SELECT 
      species_group.location_site_id as "locationSiteId",
      species_group.taxon_class_id as "taxonClassId",
      COUNT(DISTINCT species_group.taxon_species_id)::integer as "speciesCount"
    FROM (
      SELECT location_site_id, taxon_class_id, taxon_species_id
      FROM detection_by_site_species_hour
      WHERE location_project_id = ${projectId} AND ${where.join(' AND ')}
      GROUP BY location_site_id, taxon_class_id, taxon_species_id
    ) species_group
    GROUP BY species_group.location_site_id, species_group.taxon_class_id
  `

  return await sequelize.query(speciesCountBySitesSql, { type: QueryTypes.SELECT, raw: true }) as unknown as SpeciesCountBySite[]
}

export interface DetectionGroupByTaxonSpeciesId {
  taxonSpeciesId: number
}

export const getDetectionGroupByTaxonSpeciesIds = async (models: AllModels, locationProjectId: number, filter: FilterDataset): Promise<DetectionGroupByTaxonSpeciesId[]> => {
  const where = detectionConditions(locationProjectId, filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    attributes: ['taxonSpeciesId'],
    where,
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
