import { Sequelize } from 'sequelize'

import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'
import { getSequentially } from '@rfcx-bio/utils/async'

import { getIucnSpecies } from '../../data-ingest/species/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '../../data-ingest/species/input-iucn/iucn-species-narrative'
import { writeIucnSpeciesDataToPostgres } from '../../data-ingest/species/output-iucn-postgres'

export const syncIucnSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, number>, iucnCodeToId: Record<string, number>): Promise<void> => {
  const speciesNames = Object.keys(speciesNameToId)
  const [iucnSpecies, iucnSpeciesNarrative] = await Promise.all([getSequentially(speciesNames, getIucnSpecies), getSequentially(speciesNames, getIucnSpeciesNarrative)])

  const newData: TaxonSpeciesIucn[] = speciesNames.map(speciesName => {
    const iucnSpeciesData = iucnSpecies[speciesName]
    const iucnSpeciesNarrativeData = iucnSpeciesNarrative[speciesName]

    return {
      taxonSpeciesId: speciesNameToId[speciesName],
      commonName: iucnSpeciesData?.main_common_name ?? '',
      riskRatingIucnId: iucnCodeToId[iucnSpeciesData?.category ?? ''] ?? -1,
      description: iucnSpeciesNarrativeData?.habitat ?? '',
      descriptionSourceUrl: iucnSpeciesNarrativeData?.sourceUrl ?? ''
    }
  })

  await writeIucnSpeciesDataToPostgres(sequelize, newData)
}
