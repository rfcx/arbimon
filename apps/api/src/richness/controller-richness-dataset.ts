import dayjs from 'dayjs'
import { groupBy, keyBy, mapValues } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'

import { MapSiteData, SpeciesCountByTaxonName, TimeBucket } from '@rfcx-bio/common/api-bio/richness/common'
import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { SpeciesLight } from '@rfcx-bio/common/api-bio/species/types'
import { Where } from '@rfcx-bio/common/dao/helpers/query'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, TaxonClass } from '@rfcx-bio/common/dao/types'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { MockHourlyDetectionSummary, rawSpecies } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { BioInvalidQueryParamError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { FilterDataset } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
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

  const isLocationRedacted = !isProjectMember(req)

  return await getRichnessDatasetInformation(Number(projectId), { ...convertedQuery }, isLocationRedacted)
}

const getRichnessDatasetInformation = async (projectId: number, filter: FilterDataset, isLocationRedacted: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  // Filter data
  const detections = await getDetections(models, projectId, filter)
  const taxonClasses = await getTaxonClasses(models)

  return {
    isLocationRedacted,
    detectionCount: detections.length,
    speciesByTaxon: await getSpeciesByTaxon(models, sequelize, projectId, filter, taxonClasses),
    speciesBySite: getSpeciesBySite(detections),
    speciesByTime: getSpeciesByTime(detections),
    speciesPresence: getSpeciesPresence(detections, isLocationRedacted)
  }
}

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

async function getTaxonClasses (models: AllModels): Promise<TaxonClass[]> {
  return await models.TaxonClass.findAll({ raw: true })
}

// TODO 640: Move with `getSpeciesByTaxon()`
export interface DetectionsGroupByTaxonClass {
  taxonClassId: number
  speciesCount: number
}

const getSpeciesByTaxon = async (models: AllModels, sequelize: Sequelize, projectId: number, filter: FilterDataset, taxonClasses: TaxonClass[]): Promise<SpeciesCountByTaxonName> => {
  // TODO 640: Extract where cause logic to utils
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
    attributes: {
      include: ['taxon_class_id', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))'), 'species_count']]
    },
    where,
    group: 'taxon_class_id',
    raw: true
  }) as unknown as DetectionsGroupByTaxonClass[]

  const speciesCountByTaxonName: { [taxon: string]: number } = {}

  for (const { taxonClassId, speciesCount } of detectionsGroupByTaxonClass) {
    const taxonCommonName = taxonClasses.find(({ id }) => id === taxonClassId)?.commonName ?? ''
    speciesCountByTaxonName[taxonCommonName] = speciesCount
  }
  return speciesCountByTaxonName
}

const calculateSpeciesRichness = (detections: MockHourlyDetectionSummary[]): number => new Set(detections.map(d => d.species_id)).size

const getSpeciesBySite = (detections: MockHourlyDetectionSummary[]): MapSiteData[] => {
  const detectionsBySite = groupBy(detections, 'name') // TODO ?? - Extract field names
  const mapDataBySite = mapValues(detectionsBySite, (detections, siteName) => ({
    siteName,
    longitude: detections[0].lon,
    latitude: detections[0].lat,
    distinctSpecies: mapValues(groupBy(detections, 'taxon'), calculateSpeciesRichness)
  }))

  return Object.values(mapDataBySite)
}

const getSpeciesByTime = (detections: MockHourlyDetectionSummary[]): Record<TimeBucket, Record<number, number>> => {
  const SECONDS_PER_DAY = 86400 // 24 * 60 * 60

  return {
    hourOfDay: mapValues(groupByNumber(detections, d => d.hour), calculateSpeciesRichness),
    dayOfWeek: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).isoWeekday() - 1), calculateSpeciesRichness),
    monthOfYear: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).month()), calculateSpeciesRichness),
    dateSeries: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).startOf('day').unix() / SECONDS_PER_DAY), calculateSpeciesRichness)
  }
}

const getSpeciesPresence = (detections: MockHourlyDetectionSummary[], isLocationRedacted: boolean): { [speciesId: string]: SpeciesLight } => {
  const speciesIds = new Set(detections.map(d => d.species_id))

  const species = rawSpecies
    .filter(({ speciesId, extinctionRisk }) => isLocationRedacted ? speciesIds.has(speciesId) && !EXTINCTION_RISK_PROTECTED_CODES.includes(extinctionRisk) : speciesIds.has(speciesId))
    .map(({ speciesId, speciesSlug, scientificName, commonName, taxon }) =>
      ({ speciesId, speciesSlug, scientificName, commonName, taxon }))
    return keyBy(species, 'speciesId')
}
