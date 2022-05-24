import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

const testSpeciesCommonName: TaxonSpeciesCommonName[] = [
  {
    taxonSpeciesId: 1,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: 'Cat'
  },
  {
    taxonSpeciesId: 2,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: 'Cobra'
  },
  {
    taxonSpeciesId: 3,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: 'Eagle'
  },
  {
    taxonSpeciesId: 4,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: 'Sparrow'
  },
  {
    taxonSpeciesId: 5,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: 'Dog'
  },
  {
    taxonSpeciesId: 6,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.RFCx.id,
    commonName: 'Water monitor'
  },
  {
    taxonSpeciesId: 7,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    commonName: 'Cricket'
  },
  {
    taxonSpeciesId: 8,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: 'Rooster'
  },
  {
    taxonSpeciesId: 9,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    commonName: 'Poison dart frog'
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
