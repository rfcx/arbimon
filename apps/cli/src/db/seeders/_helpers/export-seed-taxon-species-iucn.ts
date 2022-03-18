import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getDataFromBioDb } from '@/data-ingest/species/input-bio-db/from-bio-db'
import { toTaxonSpeciesIucnSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-iucn-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const models = ModelRepository.getInstance(getSequelize())

  const data = await getDataFromBioDb(
    models.TaxonSpeciesIucn,
    [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }]
  )

  toTaxonSpeciesIucnSeed(data)
}

await main()
