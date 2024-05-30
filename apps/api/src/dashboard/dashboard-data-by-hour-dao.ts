import { type ApiLine } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getSequelize } from '~/db'

export const getRichnessByHour = async (locationProjectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByHour
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.richness])
  )
}

export const getDetectionByHour = async (locationProjectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardDetectionByHour
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.count])
  )
}
