import { resolve } from 'path'

import { type TaxonSpeciesPhoto } from '@rfcx-bio/node-common/dao/types'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'

export const toTaxonSpeciesPhotoSeed = (data: TaxonSpeciesPhoto[]): void => {
 objectToTsFile(
    resolve(getSeederDataDirectory(), './taxon-species-photo.ts'),
    data,
    'rawTaxonSpeciesPhoto',
    'Array<TaxonSpeciesPhoto & { \'TaxonSpecies.slug\': string }>',
    'import { TaxonSpeciesPhoto } from \'@rfcx-bio/node-common/dao/types\''
  )
}
