import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonSpeciesCalls } from '@/data-ingest/species/input-arbimon-species-call'
import { writeSpeciesCallsToPostgres } from '@/data-ingest/species/output-arbimon-species-call-postgres'

export const syncProjectSpeciesCall = async (sequelize: Sequelize, project: Project): Promise<void> => {
  console.info(`==> START SYNCING: species call ${project.slug} (ID: ${project.idArbimon})`)

  const speciesCalls = await getArbimonSpeciesCalls(project.idArbimon)
  const speciesNumber = Object.keys(speciesCalls).length

  console.info(`| total species for ${project.slug} (ID: ${project.idArbimon}) = ${speciesNumber}`)

  if (speciesNumber === 0) return

  // BIO WRITE: write species call data
  await writeSpeciesCallsToPostgres(sequelize, speciesCalls)
}
