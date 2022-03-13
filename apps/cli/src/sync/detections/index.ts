import * as hash from 'object-hash'
import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DatasourceLight, Project } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary, ArbimonNewData, getArbimonHourlyDetectionsForProject } from '@/data-ingest/detections/input'

export const syncOnlyDetectionsForProject = async (sequelize: Sequelize, project: Project): Promise<void> => {
  const detectionSummaries = await getArbimonHourlyDetectionsForProject(project.idArbimon)
  console.info('| summaries = ', project.idArbimon, detectionSummaries.length)
  await updateDatasource(sequelize, detectionSummaries, project)
}

const updateDatasource = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project): Promise<void> => {
  // build up new datasource object
  const newDatasource: DatasourceLight = {
    id: hash.MD5(summaries),
    locationProjectId: project.id
  }

  // pull the latest datasource from DB
  const model = ModelRepository.getInstance(sequelize)
  const previousDatasource = await model.Datasource.findOne({
    where: { locationProjectId: project.id },
    order: [['updatedAt', 'DESC']],
    raw: true
  })

  if (previousDatasource !== null && previousDatasource.id === newDatasource.id) {
    console.info('| nothing changed from last sync -', newDatasource.id)
    console.info('| update datasource', newDatasource)
    await model.Datasource.upsert(newDatasource)
    return
  }

  // compare if anything changes
  if (!previousDatasource) {
    console.info('| completely first datasource - need to pull out everything from Arbimon')
  } else {
    // find out what changes
    console.info('| something changes from the previous datasource - need to find diff')
  }

  const newData = await extractNewData(sequelize, summaries, project, previousDatasource)
  console.info('| new data to pull from Arbimon', newData)
  newDatasource.summaryText = JSON.stringify(summaries)

  // TODO: pull new site and species data from Arbimon
  // TODO: insert new detection data
  // TODO: remove non exist detection data

  console.info('| insert / update datasource', newDatasource)
  await model.Datasource.upsert(newDatasource)
}

const extractNewData = async (sequelize: Sequelize, summaries: ArbimonHourlyDetectionSummary[], project: Project, previousDatasource: DatasourceLight | null): Promise<ArbimonNewData> => {
  const projectSummaries = summaries.filter(s => s.project_id === project.idArbimon)
  const siteIdsInArbimon = new Set(summaries.map(s => s.site_id))
  const speciesIdsInArbimon = new Set(projectSummaries.map(s => s.species_id))

  if (!previousDatasource) return { siteIds: [...siteIdsInArbimon], speciesIds: [...speciesIdsInArbimon] }

  const model = ModelRepository.getInstance(sequelize)

  const siteIdsInBioArray = await model.LocationSite
  .findAll({
    attributes: ['idArbimon'],
    where: {
      locationProjectId: project.id
    },
    raw: true
  })
  .then(res => res.map(({ idArbimon }) => idArbimon))

  const siteIdsInBio = new Set(siteIdsInBioArray)
  const siteIdsToAdd = [...siteIdsInArbimon].filter(siteId => !siteIdsInBio.has(siteId))

  const speciesIdsInBioArray = await model.TaxonSpecies
  .findAll({
    attributes: ['idArbimon'],
    raw: true
  })
  .then(res => res.map(({ idArbimon }) => idArbimon))
  const speciesIdsInBio = new Set(speciesIdsInBioArray)
  const speciesIdsToAdd = [...speciesIdsInArbimon].filter(speciesId => !speciesIdsInBio.has(speciesId))

  return { siteIds: siteIdsToAdd, speciesIds: speciesIdsToAdd }
}

export const syncDetectionsForProject = async (sequelize: Sequelize, project: Project): Promise<void> => {
//   console.info(`==> START SYNCING: project ${project.slug} (ID: ${project.idArbimon})`)
//   // ABR QUERY: get detections from arbimon, then sites and species based on the detections
//   const summaries = await getArbimonDetectionSummaries(project.idArbimon)

//   if (summaries.length === 0) {
//     // TODO: remove existing data from the database (if needed)
//     console.info(`| no summaries for ${project.slug} (ID: ${project.idArbimon})`)
//     return
//   }

//   const sites = getSitesFromDetections(project.id, summaries)
//   const species = getArbimonSpeciesFromMock(summaries)

//   console.info(`| summaries for ${project.slug} (ID: ${project.idArbimon}) = ${summaries.length}`)
//   console.info(`| sites for ${project.slug} (ID: ${project.idArbimon}) = ${sites.length}`)
//   console.info(`| species for ${project.slug} (ID: ${project.idArbimon}) = ${Object.entries(species).length}`)

//   // TODO: save snapshot data, to compare with next sync if there is any changes then only write the changes to the db

//   // BIO WRITE: write site data
//   await writeSitesToPostgres(sequelize, sites)

//   // BIO WRITE: write species data
//   await writeArbimonSpeciesDataToPostgres(sequelize, Object.values(species))

//   // BIO WRITE: write detection data
//   await writeDetectionsToPostgres(sequelize, summaries, project)
}
