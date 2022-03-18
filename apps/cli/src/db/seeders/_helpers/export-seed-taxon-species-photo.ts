import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'

import { getDataFromBioDb } from '@/data-ingest/species/input-bio-db/from-bio-db'
import { toTaxonSpeciesPhotoSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-photo-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const model = TaxonSpeciesPhotoModel(getSequelize())
  const data = await getDataFromBioDb(model)
  toTaxonSpeciesPhotoSeed(data)
}

await main()
