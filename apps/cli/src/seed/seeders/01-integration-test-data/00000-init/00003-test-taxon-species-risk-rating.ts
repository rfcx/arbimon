import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings, masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  await models.TaxonSpeciesRiskRating.bulkCreate(testTaxonSpeciesRiskRating)
}

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
  },
  {
    taxonSpeciesId: 5,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 6,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.RFCx.id,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 7,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.Wikipedia.id,
    riskRatingId: masterRiskRatings.VU.id,
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.VU.code
  },
  {
    taxonSpeciesId: 8,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    riskRatingId: masterRiskRatings.CR.id, // global protected
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 9,
    taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
    riskRatingId: masterRiskRatings.CR.id, // global protected
    sourceUrl: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  }
]
