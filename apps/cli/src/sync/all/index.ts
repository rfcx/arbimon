import * as hash from 'object-hash'
import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DataSource, Project } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary, ArbimonNewData, getArbimonHourlyDetectionsForProject } from '@/data-ingest/detections/arbimon'
import { writeDetections } from '@/data-ingest/detections/db'
import { getArbimonSites } from '@/data-ingest/sites/arbimon'
import { writeSitesToPostgres } from '@/data-ingest/sites/db'
import { getArbimonSpecies } from '@/data-ingest/species/input-arbimon'
import { writeArbimonSpeciesDataToPostgres } from '@/data-ingest/species/output-bio-db/taxon-species'
import { syncOnlyMissingSpeciesCalls } from '@/sync/species-call/index'

export const syncAllForProject = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, project: Project): Promise<void> => {
  console.info(`- site, species, detections: ${project.slug}`)
  const detectionSummaries = await getArbimonHourlyDetectionsForProject(arbimonSequelize, project.idArbimon)
  await updateDataSource(arbimonSequelize, biodiversitySequelize, detectionSummaries, project)
}

const updateDataSource = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project): Promise<void> => {
  const models = ModelRepository.getInstance(biodiversitySequelize)

  // Get latest ProjectVersion
  // TODO

  // if(latestProjectVersion.isPublished) {

  // If frozen (already published), make new ProjectVersion & DataSource
    // QUESTION: Is it better to create the new ProjectVersion during publish, and avoid that complexity here?
    // ANSWER: Probably
    // TODO: Make a ProjectVersion
    // TODO: Make a DataSource (for this PV & source type, ex: CNN)

  // } else {

  // Else get latest data source
  // TODO: Get latest datasource for this ProjectVersion AND DataSourceType (ex: CNN)
  console.info(`- checking datasource: ${project.slug}`)
  const previousDataSource = await models.DataSource
    .findOne({
      where: { locationProjectId: project.id },
      order: [['updatedAt', 'DESC']],
      raw: true
    })

  // Do we already have this data?
  const newDataSourceId = hash.MD5(summaries)
  if (previousDataSource?.id === newDataSourceId) {
    // Touch to bump updatedAt
    console.info('| nothing changed from last sync -', newDataSourceId)
    await models.DataSource.update({}, {
      where: {
        id: previousDataSource.id,
        locationProjectId: project.id
      }
    })
    // TODO: Can we use previousDataSource.set('updatedAt', null).save()?
    return
  }

  // } // end if

  // Detect new sites/species
  console.info(`- finding out what's new: ${project.slug}`)
  const newData = await extractNewData(biodiversitySequelize, summaries, project, previousDataSource)

  // Save new sites from Arbimon
  if (newData.siteIds.length > 0) {
    console.info('| fetching %d sites', newData.siteIds.length)
    const sites = await getArbimonSites(arbimonSequelize, newData.siteIds, project.id)
    await writeSitesToPostgres(biodiversitySequelize, sites)
  }

  // Save new species from Arbimon
  if (newData.speciesIds.length > 0) {
    console.info('| fetching %d species', newData.speciesIds.length)
    const species = await getArbimonSpecies(arbimonSequelize, newData.speciesIds)
    await writeArbimonSpeciesDataToPostgres(biodiversitySequelize, species)
    console.info('| fetching species calls')
    await syncOnlyMissingSpeciesCalls(biodiversitySequelize, project)
    console.info('| fetching species information')
    // TODO: sync only missing data for project
  }

  // Save new data source
  await models.DataSource.upsert({
    id: newDataSourceId,
    locationProjectId: project.id,
    summaryText: JSON.stringify({ sites: newData.siteIds.length, species: newData.speciesIds.length })
  })

  // Save new detections
  console.info('- insert or update detection summaries')
  await writeDetections(biodiversitySequelize, summaries, project)
}

export const extractNewData = async (biodiversitySequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project, previousDatasource: DataSource | null): Promise<ArbimonNewData> => {
  const siteIdsInArbimon = new Set(summaries.map(s => s.site_id))
  const speciesIdsInArbimon = new Set(summaries.map(s => s.species_id))

  // no previous datasource, this is completely fresh new data
  if (previousDatasource === null) return { siteIds: [...siteIdsInArbimon], speciesIds: [...speciesIdsInArbimon] }

  const models = ModelRepository.getInstance(biodiversitySequelize)

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
