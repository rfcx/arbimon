import { QueryTypes, Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonSpeciesCallsForProjectSpecies } from '@/data-ingest/species/input-arbimon-call'
import { writeSpeciesCallsToPostgres } from '@/data-ingest/species/output-bio-db/taxon-species-calls'

export const syncOnlyMissingSpeciesCalls = async (sequelize: Sequelize, project: Project): Promise<void> => {
  const sql = `
  SELECT DISTINCT ts.id, ts.id_arbimon
  FROM taxon_species ts
  LEFT JOIN taxon_species_call tsc ON ts.id = tsc.taxon_species_id
  WHERE tsc.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, ts.updated_at)) >= 1 
  ORDER BY ts.id
`
  const speciesIdsArbimon = await sequelize
    .query<{ id: number, id_arbimon: number }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => allSpecies.map(s => s.id_arbimon))

  const speciesCalls = await getArbimonSpeciesCallsForProjectSpecies(project.idArbimon, speciesIdsArbimon)
  console.info('| syncOnlyMissingSpeciesCalls =', speciesIdsArbimon.length, speciesCalls.length)
  if (speciesCalls.length === 0) return
  await writeSpeciesCallsToPostgres(sequelize, speciesCalls)
}

export const syncProjectSpeciesCall = async (sequelize: Sequelize, project: Project): Promise<void> => {
  console.info(`==> START SYNCING: species call ${project.slug} (ID: ${project.idArbimon})`)

  const speciesCalls = await getArbimonSpeciesCallsForProjectSpecies(project.idArbimon)
  const speciesNumber = Object.keys(speciesCalls).length

  console.info(`| total species for ${project.slug} (ID: ${project.idArbimon}) = ${speciesNumber}`)

  if (speciesNumber === 0) return

  // BIO WRITE: write species call data
  await writeSpeciesCallsToPostgres(sequelize, speciesCalls)
}
