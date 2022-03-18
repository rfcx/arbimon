import { getTaxonSpeciesIucnFromBioDb } from '@/data-ingest/species/input-bio-db/from-taxon-species-iucn-db'
import { toTaxonSpeciesIucnSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-iucn-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const data = await getTaxonSpeciesIucnFromBioDb(sequelize)
  toTaxonSpeciesIucnSeed(data)
}

await main()
