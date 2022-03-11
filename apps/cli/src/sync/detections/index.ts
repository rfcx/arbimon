import * as hash from 'object-hash'
import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary, getArbimonHourlyDetectionsForProject } from '@/data-ingest/detections/input'

export const syncOnlyDetectionsForProject = async (sequelize: Sequelize, project: Project): Promise<void> => {
  const detectionSummaries = await getArbimonHourlyDetectionsForProject(project.idArbimon)
  console.info('| summaries = ', project.idArbimon, detectionSummaries.length)
  // compare if anything changes
  const summariesMD5 = hash.MD5(detectionSummaries)
  console.info('hash', summariesMD5)
  // TODO: save this hash into datasource log
  compareDiff(detectionSummaries, project)
}

export const compareDiff = (summaries: ArbimonHourlyDetectionSummary[], project: Project): void => {
  // compare with last sync what changed
  // TODO: save snapshot data, to compare with next sync if there is any changes then only write the changes to the db
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
