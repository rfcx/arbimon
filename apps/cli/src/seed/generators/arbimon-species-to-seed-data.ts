import dedent from 'dedent'
import { resolve } from 'path'

import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { getArbimonSpeciesIncremental } from '@/ingest/inputs/arbimon-species'
import { getGeneratedDataDirectory } from './_helpers'

const main = async (): Promise<void> => {
  // Get data
  const sequelizeArbimon = getArbimonSequelize()
  // TODO: After updated_at is added, change this to loop
  const dataRaw = await getArbimonSpeciesIncremental(sequelizeArbimon)

  // Transform data
  const data = dataRaw.sort((a, b) => a.scientificName.localeCompare(b.scientificName))

  // Write to file
  objectToTsFile(
    resolve(getGeneratedDataDirectory(), './taxon-species-arbimon.ts'),
      data,
      'mockTaxonSpeciesArbimon',
      'MockTaxonSpeciesArbimon[]',
      dedent(`interface MockTaxonSpeciesArbimon {
        idArbimon: number
        slug: string
        scientificName: string
        taxonSlug: string
      }`)
    )
}

await main()
