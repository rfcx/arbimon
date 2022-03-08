import { groupBy, keyBy, mapValues } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { DistinctSpecies, MapSiteData, SpeciesByExportReportRow, SpeciesCountByTaxonName, SpeciesPresence, TimeBucket } from '@rfcx-bio/common/api-bio/richness/common'
import { RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Site, TaxonClass } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { FilterDataset } from '../_services/mock-helper'
import { getDetectionGroupByTaxonClass, getDetectionGroupByTaxonSpeciesIds, getDetections, getSitesByProjectId, getSpeciesCountBySite, getSpeciesInProject, getTaxonClasses } from './richness-dataset-dao'

export const getRichnessDataset = async (projectId: number, filter: FilterDataset, hasProjectPermission: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  // Filter data
  const sites = await getSitesByProjectId(models, projectId)
  const taxonClasses = await getTaxonClasses(models)
  const detections = await getDetections(models, projectId, filter)

  const siteByKeys = keyBy(sites, 'id')
  const taxonClassByKeys = keyBy(taxonClasses, 'id')

  const [speciesByTaxon, speciesBySite, speciesByTime, speciesPresence, speciesByExport] = await Promise.all([
    await getSpeciesByTaxon(models, sequelize, projectId, filter, taxonClassByKeys),
    await getSpeciesBySite(sequelize, projectId, filter, taxonClassByKeys, siteByKeys),
    await getSpeciesByTime(detections),
    await getSpeciesPresence(models, projectId, filter, taxonClassByKeys, hasProjectPermission),
    await getSpeciesByExport(models, projectId, siteByKeys, detections, hasProjectPermission)
  ])

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

// TODO 640: move the Dictionary type to more generic place https://stackoverflow.com/a/68800471
export interface Dictionary<T> {
  [index: string]: T
}

const getSpeciesByTaxon = async (models: AllModels, sequelize: Sequelize, locationProjectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>): Promise<SpeciesCountByTaxonName> => {
  const detectionsGroupByTaxonClass = await getDetectionGroupByTaxonClass(models, sequelize, locationProjectId, filter)

  const speciesCountByTaxonName: { [taxon: string]: number } = {}
  for (const { taxonClassId, speciesCount } of detectionsGroupByTaxonClass) {
    const taxonCommonName = taxonClassByKeys[taxonClassId].commonName
    speciesCountByTaxonName[taxonCommonName] = speciesCount
  }

  return speciesCountByTaxonName
}

const getSpeciesBySite = async (sequelize: Sequelize, projectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>, siteByKeys: Dictionary<Site>): Promise<MapSiteData[]> => {
  const speciesCountBySite = await getSpeciesCountBySite(sequelize, projectId, filter)

  return Object.entries(groupBy(speciesCountBySite, 'locationSiteId'))
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

const getSpeciesPresence = async (models: AllModels, locationProjectId: number, filter: FilterDataset, taxonClassByKeys: Dictionary<TaxonClass>, hasProjectPermission: boolean): Promise<SpeciesPresence> => {
  const presenceSpeciesIds = (await getDetectionGroupByTaxonSpeciesIds(models, locationProjectId, filter)).flatMap(({ taxonSpeciesId }) => taxonSpeciesId)
  const species = await getSpeciesInProject(models, locationProjectId, hasProjectPermission, presenceSpeciesIds)

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
