import { keyBy, mapValues } from 'lodash-es'

import { RichnessDatasetResponse, SpeciesByExportReportRow, SpeciesPresence } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Site } from '@rfcx-bio/common/dao/types'

import { FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { getDetectionGroupByTaxonSpeciesIds, getRichnessBySite, getRichnessByTaxonClass, getSpeciesByTimeDayOfWeek, getSpeciesByTimeHourOfDay, getSpeciesByTimeMonthOfYear, getSpeciesByTimeUnix, getSpeciesInProject } from './richness-dataset-dao'

export const getRichnessDataset = async (locationProjectId: number, filter: FilterDataset, hasProjectPermission: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const filterForSql = toFilterDatasetForSql(filter)

  const [richnessByTaxon, richnessBySite, speciesByTimeHourOfDay, speciesByTimeDayOfWeek, speciesByTimeMonthOfYear, speciesByTimeUnix, speciesPresence] = await Promise.all([
    await getRichnessByTaxonClass(models, sequelize, filterForSql),
    await getRichnessBySite(sequelize, filterForSql),
    await getSpeciesByTimeHourOfDay(sequelize, filterForSql),
    await getSpeciesByTimeDayOfWeek(sequelize, filterForSql),
    await getSpeciesByTimeMonthOfYear(sequelize, filterForSql),
    await getSpeciesByTimeUnix(sequelize, filterForSql),
    await getSpeciesPresence(models, locationProjectId, filter, hasProjectPermission)
  ])

  return {
    isLocationRedacted: !hasProjectPermission,
    richnessByTaxon,
    richnessBySite,
    speciesByTimeHourOfDay,
    speciesByTimeDayOfWeek,
    speciesByTimeMonthOfYear,
    speciesByTimeUnix,
    speciesPresence
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
