import * as hash from 'object-hash'
import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DatasourceLight, Project } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary, ArbimonNewData } from '@/data-ingest/detections/input'
import { writeDetections } from '@/data-ingest/detections/output-postgres'
import { getArbimonSites } from '@/data-ingest/sites/input-arbimon'
import { writeSitesToPostgres } from '@/data-ingest/sites/output-postgres'
import { getArbimonSpecies } from '@/data-ingest/species/input-arbimon'
import { writeArbimonSpeciesDataToPostgres } from '@/data-ingest/species/output-arbimon-postgres'
import { getSequelize } from '@/db/connections'
import { syncOnlyDetectionsForProject } from '@/sync/detections'

const updateDatasource = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project): Promise<void> => {
  // build up new datasource object
  const newDatasource: DatasourceLight = {
    id: hash.MD5(summaries),
    locationProjectId: project.id
  }

  // pull the latest datasource from DB
  const models = ModelRepository.getInstance(sequelize)
  const previousDatasource = await models.Datasource.findOne({
    where: { locationProjectId: project.id },
    order: [['updatedAt', 'DESC']],
    raw: true
  })

  if (previousDatasource !== null && previousDatasource.id === newDatasource.id) {
    console.info('| nothing changed from last sync -', newDatasource.id)
    await models.Datasource.upsert(newDatasource)
    return
  }

  // find out what's new
  const newData = await extractNewData(sequelize, summaries, project, previousDatasource)
  console.info('| new data to pull from Arbimon => %d sites + %d species', newData.siteIds.length, newData.speciesIds.length)
  newDatasource.summaryText = JSON.stringify(summaries)

  // pull new site and species data from Arbimon
  if (newData.siteIds.length > 0) {
    const sites = await getArbimonSites(newData.siteIds, project.id)
    await writeSitesToPostgres(sequelize, sites)
  }

  if (newData.speciesIds.length > 0) {
    const species = await getArbimonSpecies(newData.speciesIds)
    await writeArbimonSpeciesDataToPostgres(sequelize, species)
    // TODO: get IUCN & Wiki data (if needed)
  }

  // insert new detection data
  await writeDetections(sequelize, summaries, project)

  await models.Datasource.upsert(newDatasource)
}

const extractNewData = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project, previousDatasource: DatasourceLight | null): Promise<ArbimonNewData> => {
  const projectSummaries = summaries.filter(s => s.project_id === project.idArbimon)
  const siteIdsInArbimon = new Set(summaries.map(s => s.site_id))
  const speciesIdsInArbimon = new Set(projectSummaries.map(s => s.species_id))

  if (!previousDatasource) return { siteIds: [...siteIdsInArbimon], speciesIds: [...speciesIdsInArbimon] }

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

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()
    const models = ModelRepository.getInstance(sequelize)

    const projects = await models.LocationProject.findAll()

    for (const project of projects) {
      console.info(`- site, species, detections: ${project.slug}`)
      const summaries = await syncOnlyDetectionsForProject(sequelize, project)
      await updateDatasource(sequelize, summaries, project)
    }
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
