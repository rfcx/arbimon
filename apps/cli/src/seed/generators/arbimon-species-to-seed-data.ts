import dedent from 'dedent'
import { resolve } from 'path'

import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { getArbimonSpeciesIncremental } from '@/ingest/inputs/species'
import { getGeneratedDataDirectory } from './_helpers'

const main = async (): Promise<void> => {
  const sequelizeArbimon = getArbimonSequelize()

  // TODO: After updated_at is added, change this to loop
  const data = await getArbimonSpeciesIncremental(sequelizeArbimon)

  objectToTsFile(
    resolve(getGeneratedDataDirectory(), './taxon-species-arbimon.ts'),
      data,
      'mockTaxonSpecies',
      'MockTaxonSpecies[]',
      dedent(`interface MockTaxonSpecies {
        idArbimon: number
        slug: string
        scientificName: string
        taxonSlug: string
      }`)
    )
}

await main()
