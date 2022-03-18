import { getTaxonSpeciesWikiFromBioDb } from '@/data-ingest/species/input-bio-db/from-taxon-species-wiki-db'
import { toTaxonSpeciesWikiSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-wiki-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const data = await getTaxonSpeciesWikiFromBioDb(sequelize)
  toTaxonSpeciesWikiSeed(data)
}

await main()
