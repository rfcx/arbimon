import { masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { promiseSequential } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesDescription } from '@/ingest/inputs/iucn-species-description'
import { getIucnSpeciesSourceUrl } from '@/ingest/inputs/iucn-species-source'
import { iucnDescriptionToBio } from '@/ingest/transformers/species-iucn-to-bio'
import { requireEnv } from '~/env'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })

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
      .then(description => iucnDescriptionToBio(s.id, masterTaxonSpeciesSources.IUCN.id, getIucnSpeciesSourceUrl(IUCN_BASE_URL, s.scientificName), description))
  ))

  const descriptions = maybeDescriptions.filter(isDefined)

  // Save
  console.info(`Saving ${descriptions.length} descriptions`)
  await models.TaxonSpeciesDescription.bulkCreate(descriptions)
}

await main()
