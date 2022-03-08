import { groupBy, keyBy, mapValues } from 'lodash-es'
import { Op, QueryTypes, Sequelize } from 'sequelize'

import { DistinctSpecies, MapSiteData, SpeciesByExportReportRow, SpeciesCountByTaxonName, SpeciesPresence, TimeBucket } from '@rfcx-bio/common/api-bio/richness/common'
import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Site, TaxonClass } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { BioInvalidQueryParamError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { FilterDataset } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { RISK_RATING_PROTECTED_IDS } from '../_services/security/protected-species'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const richnessDatasetHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDateUtcInclusive })

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons : typeof taxons === 'string' ? [taxons] : []
  }

  const hasProjectPermission = isProjectMember(req)

  return await getRichnessDatasetInformation(Number(projectId), { ...convertedQuery }, hasProjectPermission)
}

// TODO 640: move the Dictionary type to more generic place https://stackoverflow.com/a/68800471
export interface Dictionary<T> {
  [index: string]: T
}

const getRichnessDatasetInformation = async (projectId: number, filter: FilterDataset, hasProjectPermission: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  // Filter data
  const sites = await getSitesByProjectId(models, projectId)
  const detections = await getDetections(models, projectId, filter)
  const taxonClasses = await getTaxonClasses(models)

  const taxonClassByKeys = keyBy(taxonClasses, 'id')
  const siteByKeys = keyBy(sites, 'id')

  const speciesByTaxon = await getSpeciesByTaxon(models, sequelize, projectId, filter, taxonClassByKeys)
  const speciesBySite = await getSpeciesBySite(sequelize, projectId, filter, taxonClassByKeys, siteByKeys)
  const speciesByTime = await getSpeciesByTime(detections)
  const speciesPresence = await getSpeciesPresence(models, projectId, filter, taxonClassByKeys)
  const speciesByExport = await getSpeciesByExport(models, projectId, siteByKeys, detections, hasProjectPermission)

  return {
    isLocationRedacted: !hasProjectPermission,
    detectionCount: detections.length,
    speciesByTaxon,
    speciesBySite,
    speciesByTime,
    speciesPresence,
    speciesByExport
  }
}

// TODO 640: Extract where cause logic to utils
const getSitesByProjectId = async (models: AllModels, projectId: number): Promise<Site[]> => {
  return await models.LocationSite.findAll({ where: { locationProjectId: projectId }, raw: true })
}

// TODO 640: Extract where cause logic to utils
const getDetections = async (models: AllModels, projectId: number, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

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

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  return await models.DetectionBySiteSpeciesHour.findAll({ where, raw: true })
}

// TODO 640: Extract get taxon class to utils
const getTaxonClasses = async (models: AllModels): Promise<TaxonClass[]> => {
  return await models.TaxonClass.findAll({ raw: true })
}

// TODO 640: Move with `getSpeciesByTaxon()`
export interface DetectionsGroupByTaxonClass {
  taxonClassId: number
  speciesCount: number
}

// TODO 640: Extract where cause logic to utils
const getSpeciesByTaxon = async (models: AllModels, sequelize: Sequelize, projectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>): Promise<SpeciesCountByTaxonName> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

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

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  const detectionsGroupByTaxonClass = await models.DetectionBySiteSpeciesHour.findAll({
    attributes: ['taxonClassId', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))::integer'), 'speciesCount']],
    where,
    group: 'taxonClassId',
    raw: true
  }) as unknown as DetectionsGroupByTaxonClass[]

  const speciesCountByTaxonName: { [taxon: string]: number } = {}
  for (const { taxonClassId, speciesCount } of detectionsGroupByTaxonClass) {
    const taxonCommonName = taxonClassByKeys[taxonClassId].commonName
    speciesCountByTaxonName[taxonCommonName] = speciesCount
  }

  return speciesCountByTaxonName
}

// TODO 640: Move with `getSpeciesBySite()`
export interface SpeciesCountBySite {
  locationSiteId: number
  taxonClassId: number
  speciesCount: number
}

// TODO 640: Maybe a better way to query by sequelize
const getSpeciesBySite = async (sequelize: Sequelize, projectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>, siteByKeys: Dictionary<Site>): Promise<MapSiteData[]> => {
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

  const allSpeciesCountGroupedBySitesQuery = await sequelize.query(speciesCountBySitesSql, { type: QueryTypes.SELECT, raw: true }) as unknown as SpeciesCountBySite[]

  return Object.entries(groupBy(allSpeciesCountGroupedBySitesQuery, 'locationSiteId'))
    .map(([_, uniqueTaxonClassInSite]) => {
      const matchedSite = siteByKeys[uniqueTaxonClassInSite[0].locationSiteId]

      const distinctSpecies: DistinctSpecies = {}
      for (const data of uniqueTaxonClassInSite) {
        const matchedTaxon = taxonClassByKeys[data.taxonClassId]
        distinctSpecies[matchedTaxon.commonName] = data.speciesCount
      }

      return {
        siteName: matchedSite.name,
        longitude: matchedSite.longitude,
        latitude: matchedSite.latitude,
        distinctSpecies: distinctSpecies
      }
    })
}

const calculateSpeciesRichness = (detections: DetectionBySiteSpeciesHour[]): number => new Set(detections.map(d => d.taxonSpeciesId)).size

// TODO 640: Change to query from db instead of by js function
const getSpeciesByTime = async (detections: DetectionBySiteSpeciesHour[]): Promise<Record<TimeBucket, Record<number, number>>> => {
  const SECONDS_PER_DAY = 86400 // 24 * 60 * 60

  return {
    hourOfDay: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).hour()), calculateSpeciesRichness),
    dayOfWeek: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1), calculateSpeciesRichness),
    monthOfYear: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).month()), calculateSpeciesRichness),
    dateSeries: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY), calculateSpeciesRichness)
  }
}

const getSpeciesPresence = async (models: AllModels, projectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>): Promise<SpeciesPresence> => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = filter

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

  if (taxons.length > 0) {
    where.taxonClassId = taxons
  }

  const presenceSpeciesIds = (await models.DetectionBySiteSpeciesHour.findAll({
    attributes: ['taxonSpeciesId'],
    where,
    group: 'taxonSpeciesId',
    raw: true
  })).flatMap(({ taxonSpeciesId }) => taxonSpeciesId)

  const species = await models.SpeciesInProject.findAll({
    where: {
      locationProjectId: projectId,
      taxonSpeciesId: presenceSpeciesIds,
      riskRatingId: { [Op.notIn]: RISK_RATING_PROTECTED_IDS }
    },
    raw: true
  })

  const presenceSpecies: SpeciesPresence = {}

  // TODO 640: Clean up species type both api and frontend
  for (const s of species) {
    const { taxonSpeciesId, taxonSpeciesSlug, scientificName, commonName, taxonClassId } = s
    presenceSpecies[taxonSpeciesId] = {
      speciesId: taxonSpeciesId,
      speciesSlug: taxonSpeciesSlug,
      scientificName,
      commonName,
      taxon: taxonClassByKeys[taxonClassId].commonName
    }
  }

  return presenceSpecies
}

// TODO 640: Move project species query to utilities and clean up?
const getSpeciesByExport = async (models: AllModels, projectId: number, siteByKeys: Dictionary<Site>, detections: DetectionBySiteSpeciesHour[], hasProjectPermission: boolean): Promise<SpeciesByExportReportRow[]> => {
  const where: Where<SpeciesInProject> = {
    locationProjectId: projectId
  }

  if (!hasProjectPermission) {
    where.riskRatingId = {
      [Op.notIn]: RISK_RATING_PROTECTED_IDS
    }
  }

  const species = await models.SpeciesInProject.findAll({
    where,
    raw: true
  })

  let filteredDetections = detections
  if (!hasProjectPermission) {
    const speciesIds = species.map(({ taxonSpeciesId }) => taxonSpeciesId)
    filteredDetections = detections.filter(({ taxonSpeciesId }) => speciesIds.includes(taxonSpeciesId))
  }

  const speciesByKeys = keyBy(species, 'taxonSpeciesId')
  return filteredDetections.map(({ taxonSpeciesId, locationSiteId, timePrecisionHourLocal }) => {
    const matchedSpecies = speciesByKeys[taxonSpeciesId]
    const { name: siteName, latitude, longitude, altitude } = siteByKeys[locationSiteId]

    const newDate = dayjs.utc(timePrecisionHourLocal)

    return {
      species: matchedSpecies.scientificName,
      site: siteName,
      latitude,
      longitude,
      altitude,
      day: newDate.format('D'),
      month: newDate.format('M'),
      year: newDate.format('YYYY'),
      date: newDate.format('M/DD/YYYY'),
      hour: newDate.format('H')
    }
  }).sort((a, b) =>
    a.species.localeCompare(b.species) ||
    a.site.localeCompare(b.site) ||
    a.date.localeCompare(b.date) ||
    Number(a.hour) - Number(b.hour)
  )
}
