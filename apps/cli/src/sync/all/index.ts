import * as hash from 'object-hash'
import { Optional, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DataSource, Project } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary, ArbimonNewData, getArbimonHourlyDetectionsForProject } from '@/data-ingest/detections/arbimon'
import { writeDetections } from '@/data-ingest/detections/db'
import { getArbimonSites } from '@/data-ingest/sites/arbimon'
import { writeSitesToPostgres } from '@/data-ingest/sites/db'
import { getArbimonSpecies } from '@/data-ingest/species/arbimon'
import { writeArbimonSpeciesDataToPostgres } from '@/data-ingest/species/db/taxon-species'
import { syncOnlyMissingSpeciesCalls } from '@/sync/species-call/index'

export const syncAllForProject = async (sequelize: Sequelize, project: Project): Promise<void> => {
  console.info(`- site, species, detections: ${project.slug}`)
  const detectionSummaries = await getArbimonHourlyDetectionsForProject(project.idArbimon)
  await updateDataSource(sequelize, detectionSummaries, project)
}

const updateDataSource = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project): Promise<void> => {
  // build up new datasource object
  const newDataSource: Optional<DataSource, 'updatedAt' | 'createdAt'> = {
    id: hash.MD5(summaries),
    locationProjectId: project.id,
    rawData: JSON.stringify(summaries),
    summaryText: ''
  }

  // TODO: Get ProjectVersion
  // TODO: create new project version row if needed, make its first data source, store the detections data, and return

  // TODO: pull the latest datasource from DB for the latest project version
  console.info(`- checking datasource: ${project.slug}`)
  const models = ModelRepository.getInstance(sequelize)
  const previousDataSource = await models.DataSource.findOne({
    where: { locationProjectId: project.id },
    order: [['updatedAt', 'DESC']],
    raw: true
  })

  if (previousDataSource !== null && previousDataSource.id === newDataSource.id) {
    console.info('| nothing changed from last sync -', newDataSource.id)
    await models.DataSource.upsert(newDataSource)
    return
  }

  // find out what's new
  console.info(`- finding out what's new: ${project.slug}`)
  const newData = await extractNewData(sequelize, summaries, project, previousDataSource)
  newDataSource.rawData = JSON.stringify(summaries)
  newDataSource.summaryText = JSON.stringify({ sites: newData.siteIds.length, species: newData.speciesIds.length })

  // pull new site and species data from Arbimon
  if (newData.siteIds.length > 0) {
    console.info('| fetching %d sites', newData.siteIds.length)
    const sites = await getArbimonSites(newData.siteIds, project.id)
    await writeSitesToPostgres(sequelize, sites)
  }

  if (newData.speciesIds.length > 0) {
    console.info('| fetching %d species', newData.speciesIds.length)
    const species = await getArbimonSpecies(newData.speciesIds)
    await writeArbimonSpeciesDataToPostgres(sequelize, species)
    console.info('| fetching species calls')
    await syncOnlyMissingSpeciesCalls(sequelize, project)
    console.info('| fetching species information')
    // TODO: sync only missing data for project
  }

  // insert new detection data
  console.info('- insert or update detection summaries')
  await writeDetections(sequelize, summaries, project)

  await models.DataSource.upsert(newDataSource)
}

const extractNewData = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project, previousDatasource: DataSource | null): Promise<ArbimonNewData> => {
  const siteIdsInArbimon = new Set(summaries.map(s => s.site_id))
  const speciesIdsInArbimon = new Set(summaries.map(s => s.species_id))

  // no previous datasource, this is completely fresh new data
  if (previousDatasource === null) return { siteIds: [...siteIdsInArbimon], speciesIds: [...speciesIdsInArbimon] }

  const models = ModelRepository.getInstance(sequelize)

  const siteIdsInBioArray = await models.LocationSite.findAll({
    attributes: ['idArbimon'],
    where: {
      locationProjectId: project.id
    },
    raw: true
  })
  .then(res => res.map(({ idArbimon }) => idArbimon))

  const siteIdsInBio = new Set(siteIdsInBioArray)
  const siteIdsToAdd = [...siteIdsInArbimon].filter(siteId => !siteIdsInBio.has(siteId))

  const speciesIdsInBioArray = await models.TaxonSpecies.findAll({
    attributes: ['idArbimon'],
    raw: true
  })
  .then(res => res.map(({ idArbimon }) => idArbimon))
  const speciesIdsInBio = new Set(speciesIdsInBioArray)
  const speciesIdsToAdd = [...speciesIdsInArbimon].filter(speciesId => !speciesIdsInBio.has(speciesId))

  return { siteIds: siteIdsToAdd, speciesIds: speciesIdsToAdd }
}
