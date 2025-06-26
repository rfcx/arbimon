import { type Sequelize, QueryTypes } from 'sequelize'

import { RiskRatingIucnModel } from '@rfcx-bio/node-common/dao/models/risk-rating-iucn-model'
import { type TaxonSpeciesIucn } from '@rfcx-bio/node-common/dao/types'
import { getSequentially } from '@rfcx-bio/utils/async'

import { getIucnSpecies } from '@/ingest/_refactor/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '@/ingest/_refactor/input-iucn/iucn-species-narrative'
import { writeIucnSpeciesDataToPostgres } from '@/ingest/_refactor/output-bio-db/taxon-species-iucn'

const DEFAULT_RISK_RATING = -1

export const syncOnlyMissingIUCNSpeciesInfo = async (sequelize: Sequelize): Promise<void> => {
  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name, tsi.risk_rating_iucn_id
    FROM taxon_species ts
    LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
    WHERE tsi.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, tsi.updated_at)) >= 1 
    ORDER BY ts.id
  `
  const speciesNameToId = await sequelize
    .query<{ id: number, scientific_name: string, risk_rating_iucn_id: number }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, { id: s.id, riskRatingIucnId: s.risk_rating_iucn_id }])))
  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))
  console.info('| syncOnlyMissingIUCNSpeciesInfo =', Object.entries(speciesNameToId).length)
  await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)
}

export const syncIucnSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, { id: number, riskRatingIucnId: number }>, iucnCodeToId: Record<string, number>): Promise<void> => {
  const speciesNames = Object.keys(speciesNameToId)
  const [iucnSpecies, iucnSpeciesNarrative] = await Promise.all([getSequentially(speciesNames, getIucnSpecies), getSequentially(speciesNames, getIucnSpeciesNarrative)])

  const newData: TaxonSpeciesIucn[] = speciesNames.map(speciesName => {
    const iucnSpeciesData = iucnSpecies[speciesName]
    const iucnSpeciesNarrativeData = iucnSpeciesNarrative[speciesName]

    console.info('speciesName', speciesName)
    return {
      taxonSpeciesId: speciesNameToId[speciesName].id,
      commonName: iucnSpeciesData?.common_names[0]?.name ?? '',
      riskRatingIucnId: iucnCodeToId[iucnSpeciesData?.assessments[0]?.red_list_category_code ?? ''] ?? speciesNameToId[speciesName].riskRatingIucnId ?? DEFAULT_RISK_RATING,
      description: iucnSpeciesNarrativeData?.documentation?.habitats ?? '',
      descriptionSourceUrl: iucnSpeciesNarrativeData?.sourceUrl ?? ''
    }
  })

  await writeIucnSpeciesDataToPostgres(sequelize, newData)
}
