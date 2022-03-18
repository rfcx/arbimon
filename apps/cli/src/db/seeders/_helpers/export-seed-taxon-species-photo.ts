import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getDataFromBioDb } from '@/data-ingest/species/input-bio-db/from-bio-db'
import { toTaxonSpeciesPhotoSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-photo-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const models = ModelRepository.getInstance(getSequelize())

  const data = await getDataFromBioDb(
    models.TaxonSpeciesPhoto,
    [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }]
  )

  toTaxonSpeciesPhotoSeed(data)
}

await main()
