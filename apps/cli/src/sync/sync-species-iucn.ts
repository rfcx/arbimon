import { QueryTypes } from 'sequelize'

import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'

import { syncIucnSpeciesInfo } from '@/sync/species-info/iucn'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  const sql = `
    SELECT ts.id, ts.scientific_name
    FROM taxon_species ts
    LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
    WHERE tsi.taxon_species_id IS NULL
  `
  const speciesNameToId = await sequelize
    .query<{ id: number, scientific_name: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, s.id])))

  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.idOrdered])))

  await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)

  process.exit(0)
}

await main()
