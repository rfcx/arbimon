import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonClasses, masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

const testSpeciesCommonName: TaxonSpeciesCommonName[] = [
  {
    taxonSpeciesId: 1,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: masterTaxonClasses.Mammals.commonName
  },
  {
    taxonSpeciesId: 2,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: masterTaxonClasses.Amphibians.commonName
  },
  {
    taxonSpeciesId: 3,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: masterTaxonClasses.Birds.commonName
  },
  {
    taxonSpeciesId: 4,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: masterTaxonClasses.Birds.commonName
  }
]

/**
 * Create mocked taxon species
 * @param params
 */
export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpeciesCommonName
    .bulkCreate(testSpeciesCommonName)
}
