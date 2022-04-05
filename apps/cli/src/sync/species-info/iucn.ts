import { QueryTypes, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

const DEFAULT_RISK_RATING = -1

export const syncOnlyMissingIUCNSpeciesInfo = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name
    FROM taxon_species ts
    LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
    WHERE tsi.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, ts.updated_at)) >= 1 
    ORDER BY ts.id
  `
  const speciesNameToId = await sequelize
    .query<{ id: number, scientific_name: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, s.id])))

  const iucnCodeToId: Record<string, number> = await models.RiskRating.findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))
  console.info('| syncOnlyMissingIUCNSpeciesInfo =', Object.entries(speciesNameToId).length)
  await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)
}

export const syncIucnSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, number>, iucnCodeToId: Record<string, number>): Promise<void> => {
  // const speciesNames = Object.keys(speciesNameToId)
  // const [iucnSpecies, iucnSpeciesNarrative] = await Promise.all([getSequentially(speciesNames, getIucnSpecies), getSequentially(speciesNames, getIucnSpeciesNarrative)])

  // const newData: TaxonSpeciesRiskRating[] = speciesNames.map(speciesName => {
  //   const iucnSpeciesData = iucnSpecies[speciesName]
  //   const iucnSpeciesNarrativeData = iucnSpeciesNarrative[speciesName]

  //   return {
  //     taxonSpeciesId: speciesNameToId[speciesName],
  //     commonName: iucnSpeciesData?.main_common_name ?? '',
  //     riskRatingIucnId: iucnCodeToId[iucnSpeciesData?.category ?? ''] ?? DEFAULT_RISK_RATING,
  //     description: iucnSpeciesNarrativeData?.habitat ?? '',
  //     descriptionSourceUrl: iucnSpeciesNarrativeData?.sourceUrl ?? ''
  //   }
  // })

  // await writeIucnSpeciesDataToPostgres(sequelize, newData)
}
