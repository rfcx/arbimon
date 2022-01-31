import { filterMocksByParameters } from '_services/mock-helper'
import dayjs from 'dayjs'
import { groupBy, keyBy, mapValues } from 'lodash-es'

import { MapSiteData, TimeBucket } from '@rfcx-bio/common/api-bio/richness/common'
import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { SpeciesLight } from '@rfcx-bio/common/api-bio/species/common'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { MockHourlyDetectionSummary, rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { Handler } from '../_services/api-helpers/types'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const RichnessDatasetHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) assertInvalidQuery({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) assertInvalidQuery({ endDateUtcInclusive })

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    siteIds: siteIds ?? [],
    taxons: taxons ?? []
  }

  const detections = filterMocksByParameters(rawDetections, { ...convertedQuery })
  const isLocationRedacted = !isProjectMember(req)

  return await getRichnessDatasetInformation(detections, isLocationRedacted)
}

async function getRichnessDatasetInformation (detections: MockHourlyDetectionSummary[], isLocationRedacted: boolean): Promise<RichnessDatasetResponse> {
  return {
    isLocationRedacted,
    detectionCount: detections.length,
    speciesByTaxon: getSpeciesByTaxon(detections),
    speciesBySite: getSpeciesBySite(detections),
    speciesByTime: getSpeciesByTime(detections),
    speciesPresence: getSpeciesPresence(detections, isLocationRedacted)
  }
}

const calculateSpeciesRichness = (detections: MockHourlyDetectionSummary[]): number => new Set(detections.map(d => d.species_id)).size

const getSpeciesByTaxon = (detections: MockHourlyDetectionSummary[]): { [taxon: string]: number } => {
  const detectionsByTaxon = groupBy(detections, 'taxon')
  return mapValues(detectionsByTaxon, calculateSpeciesRichness)
}

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
