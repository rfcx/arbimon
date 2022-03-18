import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'

import { getDataFromBioDb } from '@/data-ingest/species/input-bio-db/from-bio-db'
import { toTaxonSpeciesWikiSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-wiki-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const model = TaxonSpeciesWikiModel(getSequelize())
  const data = await getDataFromBioDb(model)
  toTaxonSpeciesWikiSeed(data)
}

await main()
