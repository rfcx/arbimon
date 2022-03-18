import { getTaxonSpeciesPhotoFromBioDb } from '@/data-ingest/species/input-bio-db/from-taxon-species-photo-db'
import { toTaxonSpeciesPhotoSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-photo-seed'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const data = await getTaxonSpeciesPhotoFromBioDb(sequelize)
  toTaxonSpeciesPhotoSeed(data)
}

await main()
