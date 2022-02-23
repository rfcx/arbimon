import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonDetectionSummaries } from '@/data-ingest/detections/input-arbimon'
import { getSitesFromDetections } from '@/data-ingest/sites/input-from-mock-detections'
import { writeSitesToPostgres } from '@/data-ingest/sites/output-postgres'
import { getArbimonSpeciesFromMock } from '@/data-ingest/species/input-from-mock-detections'

export const syncDetectionsForProject = async (project: Project): Promise<void> => {
  console.info('==> START SYNCING: project ', project.idArbimon)
  // ABR QUERY: get detections from arbimon, then sites and species based on the detections
  const summaries = await getArbimonDetectionSummaries(project.idArbimon)

  if (summaries.length === 0) {
    // TODO: remove existing data from the database (if needed)
    return
  }

  const sites = await getSitesFromDetections(project.id, summaries)
  const species = await getArbimonSpeciesFromMock(summaries) // TODO: @nui change this method

  console.info(`summaries for ${project.idArbimon} = ${summaries.length}`)
  console.info(`sites for ${project.idArbimon} = ${sites.length}`)
  console.info(`species for ${project.idArbimon} = ${Object.entries(species).length}`)

  // BIO WRITE: write site data
  await writeSitesToPostgres(sites)

  // TODO: BIO WRITE: write species data
  // TODO: BIO WRITE: write detection data
}
