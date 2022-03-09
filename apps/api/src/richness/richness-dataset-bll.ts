import { keyBy, mapValues } from 'lodash-es'

import { RichnessDatasetResponse, SpeciesByExportReportRow, SpeciesPresence, TimeBucket } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Site } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { getDetectionGroupByTaxonSpeciesIds, getRichnessBySite, getRichnessByTaxonClass, getSitesByProjectId, getSpeciesByTimeHourOfDay, getSpeciesInProject } from './richness-dataset-dao'

export const getRichnessDataset = async (locationProjectId: number, filter: FilterDataset, hasProjectPermission: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const filterForSql = toFilterDatasetForSql(filter)

  // Filter data
  const sites = await getSitesByProjectId(models, locationProjectId)
  const detections = await getDetections(models, locationProjectId, filter)

  const siteByKeys = keyBy(sites, 'id')

  const [richnessByTaxon, richnessBySite, speciesByTimeHourOfDay, speciesByTime, speciesPresence, speciesByExport] = await Promise.all([
    await getRichnessByTaxonClass(models, sequelize, filterForSql),
    await getRichnessBySite(sequelize, filterForSql),
    await getSpeciesByTimeHourOfDay(sequelize, filterForSql),
    await getSpeciesByTime(detections),
    await getSpeciesPresence(models, locationProjectId, filter, hasProjectPermission),
    await getSpeciesByExport(models, locationProjectId, siteByKeys, detections, hasProjectPermission)
  ])

  return {
    isLocationRedacted: !hasProjectPermission,
    richnessByTaxon,
    richnessBySite,
    speciesByTimeHourOfDay,
    speciesByTimeDayOfWeek,
    speciesByTimeMonthOfYear,
    speciesByTimeUnixSeconds,
    speciesPresence,
    speciesByExport
  }
}

const calculateSpeciesRichness = (detections: DetectionBySiteSpeciesHour[]): number => new Set(detections.map(d => d.taxonSpeciesId)).size

// TODO 640: Change to query from db instead of by js function?
const getSpeciesByTime = async (detections: DetectionBySiteSpeciesHour[]): Promise<Record<TimeBucket, Record<number, number>>> => {
  const SECONDS_PER_DAY = 86400 // 24 * 60 * 60

  return {
    hourOfDay: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).hour()), calculateSpeciesRichness),
    dayOfWeek: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1), calculateSpeciesRichness),
    monthOfYear: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).month()), calculateSpeciesRichness),
    dateSeries: mapValues(groupByNumber(detections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY), calculateSpeciesRichness)
  }
}

const getSpeciesPresence = async (models: AllModels, locationProjectId: number, filter: FilterDataset, hasProjectPermission: boolean): Promise<SpeciesPresence> => {
  // TODO: Get this as 1 JOIN
  const presenceSpeciesIds = (await getDetectionGroupByTaxonSpeciesIds(models, locationProjectId, filter)).flatMap(({ taxonSpeciesId }) => taxonSpeciesId)
  const species = await getSpeciesInProject(models, locationProjectId, hasProjectPermission, presenceSpeciesIds)

  return mapValues(keyBy(species, 'taxonSpeciesId'), ({ taxonSpeciesId, taxonSpeciesSlug, scientificName, commonName, taxonClassId }) => ({
    speciesId: taxonSpeciesId,
    speciesSlug: taxonSpeciesSlug,
    scientificName,
    commonName,
    taxon: taxonClassId
  }))
}

const getSpeciesByExport = async (models: AllModels, locationProjectId: number, siteByKeys: Dictionary<Site>, detections: DetectionBySiteSpeciesHour[], hasProjectPermission: boolean): Promise<SpeciesByExportReportRow[]> => {
  const species = await getSpeciesInProject(models, locationProjectId, hasProjectPermission)

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
  }).sort((a, b) => // ? should it sort by api?
    a.species.localeCompare(b.species) ||
    a.site.localeCompare(b.site) ||
    a.date.localeCompare(b.date) ||
    Number(a.hour) - Number(b.hour)
  )
}
