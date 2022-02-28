import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonDetectionSummaries } from '@/data-ingest/detections/input-arbimon'
import { writeDetectionsToPostgres } from '@/data-ingest/detections/output-postgres'
import { getSitesFromDetections } from '@/data-ingest/sites/input-from-mock-detections'
import { writeSitesToPostgres } from '@/data-ingest/sites/output-postgres'
import { getArbimonSpeciesFromMock } from '@/data-ingest/species/input-from-mock-detections'
import { writeArbimonSpeciesDataToPostgres } from '@/data-ingest/species/output-arbimon-postgres'

export const syncDetectionsForProject = async (sequelize: Sequelize, project: Project): Promise<void> => {
  console.info('==> START SYNCING: project ', project.idArbimon)
  // ABR QUERY: get detections from arbimon, then sites and species based on the detections
  const summaries = await getArbimonDetectionSummaries(project.idArbimon)

  if (summaries.length === 0) {
    // TODO: remove existing data from the database (if needed)
    console.info(`| no summaries for ${project.idArbimon}`)
    return
  }

  const sites = await getSitesFromDetections(project.id, summaries)
  const species = await getArbimonSpeciesFromMock(summaries)

  console.info(`| summaries for ${project.idArbimon} = ${summaries.length}`)
  console.info(`| sites for ${project.idArbimon} = ${sites.length}`)
  console.info(`| species for ${project.idArbimon} = ${Object.entries(species).length}`)

  // TODO: save snapshot data, to compare with next sync if there is any changes then only write the changes to the db

  // BIO WRITE: write site data
  await writeSitesToPostgres(sequelize, sites)

  // BIO WRITE: write species data
  await writeArbimonSpeciesDataToPostgres(sequelize, Object.values(species))

  // BIO WRITE: write detection data
  await writeDetectionsToPostgres(sequelize, summaries, project)
}
