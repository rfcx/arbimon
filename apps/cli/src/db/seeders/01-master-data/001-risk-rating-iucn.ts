import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'

import { rawRiskRatings } from '../_data/risk-rating'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await RiskRatingIucnModel(params.context.sequelize)
    .bulkCreate(rawRiskRatings)
}
