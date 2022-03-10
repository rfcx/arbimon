import { QueryTypes } from 'sequelize/dist'

import { getSequelize } from '../db/connections'
import { syncWikiSpeciesInfo } from './species-info/wiki'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name
    FROM taxon_species ts
    LEFT JOIN taxon_species_wiki tsw ON ts.id = tsw.taxon_species_id
    WHERE tsw.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, ts.updated_at)) >= 1 
    ORDER BY ts.id
  `
  // Lookups
  const speciesNameToId: Record<string, number> = await sequelize
    .query<{ id: number, scientific_name: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, s.id])))

  await syncWikiSpeciesInfo(sequelize, speciesNameToId)

  process.exit(0)
}

await main()
