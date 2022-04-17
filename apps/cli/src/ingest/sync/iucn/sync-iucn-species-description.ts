import { masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesDescription } from '@rfcx-bio/common/dao/types'
import { promiseSequential } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesDescription } from '@/ingest/inputs/iucn-species-description'

export const syncIucnSpeciesDescription = async (models: AllModels, iucnService: IucnService): Promise<void> => {
  // Get species to sync
  const speciesToSync = await models.TaxonSpecies
    .findAll({
      // where: {} // TODO: Think of a way to track the last time each sync was attempted (ex: don't keep spamming IUCN for species they don't have)
      attributes: ['id', 'scientificName'],
      limit: 100,
      order: [['scientificName', 'ASC']],
      raw: true
    })
  console.info(`Found ${speciesToSync.length} species to sync`)

  // Call IUCN APIs
  const maybeDescriptions = await promiseSequential( // TODO: Call batching
    speciesToSync.map(async s => await getIucnSpeciesDescription(iucnService, s.scientificName)
      .then(description => iucnDescriptionToBio(s.id, masterTaxonSpeciesSources.IUCN.id, iucnService.getIucnSpeciesSourceUrl(s.scientificName), description))
  ))
  const descriptions = maybeDescriptions.filter(isDefined)

  // Save
  console.info(`Saving ${descriptions.length} descriptions`)
  await models.TaxonSpeciesDescription.bulkCreate(descriptions)
}

export const iucnDescriptionToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, sourceUrl: string, description?: string): TaxonSpeciesDescription | undefined => {
  if (!description) return undefined

  return {
    taxonSpeciesId,
    taxonSpeciesSourceId,
    sourceUrl,
    description
  }
}
