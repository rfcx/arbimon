import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonHourlyDetectionsForProject } from '@/data-ingest/detections/input-arbimon'

// Idea:
// - Bio Query: Get all species idArbimon
// - Bio Query: Get all site idArbimon
// - Arb Query 1: Get detection data (only)

// - Arb Query 2: Find which sites aren't in Bio DB => get them
// - Arb Query 3: Find which species aren't in Bio DB => get them
// - Save everything
// - Return list of new species IDs (can get this when saving?)

export interface ArbimonNewData {
  species: Record<string, number> // scientificName -> id (bio)
}

export const syncDetectionsForProject = async (sequelize: Sequelize, project: Project): Promise<ArbimonNewData> => {
  console.info(`==> START SYNCING: project ${project.slug} (ID: ${project.idArbimon})`)

  // Detections

  // ABR QUERY: get detections from arbimon, then sites and species based on the detections
  const summaries = await getArbimonHourlyDetectionsForProject(project.idArbimon)

  // Sites

  // get site ids (Arbimon) from summaries
  const siteIdsInArbimon = new Set(summaries.map(s => s.site_id))
  // get site ids (Bio)
  const siteIdsInBioArray = await ModelRepository.getInstance(sequelize)
    .LocationSite
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
  const siteIdsToDelete = siteIdsInBioArray.filter(siteId => !siteIdsInArbimon.has(siteId))

  // Get new site data from Arbimon
  // Save new site data in Bio
  // Delete old site data from Bio

  // Species

  // get species ids (Arbimon) from summaries
  const speciesIdsInArbimon = new Set(summaries.map(s => s.species_id))
  // get species ids (Bio)
  const speciesIdsInBioArray = await ModelRepository.getInstance(sequelize)
    .TaxonSpecies
    .findAll({
      attributes: ['idArbimon'],
      raw: true
    })
    .then(res => res.map(({ idArbimon }) => idArbimon))

  const speciesIdsInBio = new Set(speciesIdsInBioArray)

  const speciesIdsToAdd = [...speciesIdsInArbimon].filter(speciesId => !speciesIdsInBio.has(speciesId))

  // Get new species data from Arbimon
  // Save new species in Bio
  // Do NOT delete old species

  // Save detections in Bio

  // Return NEW IDs from Bio

  // TODO: Query Arbimon to get new species data; save in Bio <<< BIO IDs

  // const sites = getSitesFromDetections(project.id, summaries)
  // const species = getArbimonSpeciesFromMock(summaries)

  // console.info(`| summaries for ${project.slug} (ID: ${project.idArbimon}) = ${summaries.length}`)
  // console.info(`| sites for ${project.slug} (ID: ${project.idArbimon}) = ${sites.length}`)
  // console.info(`| species for ${project.slug} (ID: ${project.idArbimon}) = ${Object.entries(species).length}`)

  // // TODO: save snapshot data, to compare with next sync if there is any changes then only write the changes to the db

  // // BIO WRITE: write site data
  // await writeSitesToPostgres(sequelize, sites)

  // // BIO WRITE: write species data
  // await writeArbimonSpeciesDataToPostgres(sequelize, Object.values(species))

  // // BIO WRITE: write detection data
  // await writeDetectionsToPostgres(sequelize, summaries, project)
}
