import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings, masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

const testTaxonSpeciesRiskRating: TaxonSpeciesRiskRating[] = [
  {
    taxonSpeciesId: 1,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 2,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 3,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 4,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  }
]

/**
 * Create mocked taxon species
 * @param params
 */
export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpeciesRiskRating
    .bulkCreate(testTaxonSpeciesRiskRating)
}
