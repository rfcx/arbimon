import { type ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getTotalSpecies = async (locationProjectId: number): Promise<number> => {
  const { LocationProjectMetric } = ModelRepository.getInstance(getSequelize())
  const metric = await LocationProjectMetric.findOne({
    attributes: ['speciesCount'],
    where: { locationProjectId },
    raw: true
  })
  return metric?.speciesCount ?? 0
}

export const getRichnessByRisk = async (locationProjectId: number): Promise<ApiStack> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByRisk
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return result.map(r => [r.riskRatingId, r.count])
}
