import { resolve } from 'path'

import { type TaxonSpeciesIucn } from '@rfcx-bio/node-common/dao/types'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'

export const toTaxonSpeciesIucnSeed = (data: TaxonSpeciesIucn[]): void => {
 objectToTsFile(
    resolve(getSeederDataDirectory(), './taxon-species-iucn.ts'),
    data,
    'rawTaxonSpeciesIucn',
    'Array<TaxonSpeciesIucn & { \'TaxonSpecies.slug\': string }>',
    'import { TaxonSpeciesIucn } from \'@rfcx-bio/node-common/dao/types\''
  )
}
