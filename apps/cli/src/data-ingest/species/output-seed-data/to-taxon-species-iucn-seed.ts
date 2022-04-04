import { resolve } from 'path'

import { TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'

export const toTaxonSpeciesIucnSeed = (data: TaxonSpeciesRiskRating[]): void =>
  objectToTsFile(
    resolve(getSeederDataDirectory(), './taxon-species-iucn.ts'),
    data,
    'rawTaxonSpeciesIucn',
    'Array<TaxonSpeciesIucn & { \'TaxonSpecies.slug\': string }>',
    'import { TaxonSpeciesIucn } from \'@rfcx-bio/common/dao/types\''
  )
