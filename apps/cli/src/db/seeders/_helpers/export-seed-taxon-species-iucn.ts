import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'

import { getDataFromBioDb } from '@/data-ingest/species/input-bio-db/from-bio-db'
import { toTaxonSpeciesIucnSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-iucn-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const model = TaxonSpeciesIucnModel(getSequelize())
  const data = await getDataFromBioDb(model)
  toTaxonSpeciesIucnSeed(data)
}

await main()
