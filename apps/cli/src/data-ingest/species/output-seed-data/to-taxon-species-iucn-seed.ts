import { resolve } from 'path'

import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'

export const toTaxonSpeciesIucnSeed = (data: TaxonSpeciesIucn[]): void =>
  objectToTsFile(
    resolve(getSeederDataDirectory(), './taxon-species-iucn.ts'),
    data,
    'rawTaxonSpeciesIucn',
    'TaxonSpeciesIucn[]',
    'import { TaxonSpeciesIucn } from \'@rfcx-bio/common/dao/types\''
  )
