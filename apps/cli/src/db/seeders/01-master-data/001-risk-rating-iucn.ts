import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { RiskRatingModel } from '@rfcx-bio/common/dao/models-table/risk-rating-model'

import { rawRiskRatings } from '../_data/risk-rating'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await RiskRatingModel(params.context.sequelize)
    .bulkCreate(rawRiskRatings)
}
