import { resolve } from 'path'

import { type TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'

export const toTaxonSpeciesWikiSeed = (data: TaxonSpeciesWiki[]): void => {
 objectToTsFile(
    resolve(getSeederDataDirectory(), './taxon-species-wiki.ts'),
    data,
    'rawTaxonSpeciesWiki',
    'Array<TaxonSpeciesWiki & { \'TaxonSpecies.slug\': string }>',
    'import { TaxonSpeciesWiki } from \'@rfcx-bio/common/dao/types\''
  )
}
