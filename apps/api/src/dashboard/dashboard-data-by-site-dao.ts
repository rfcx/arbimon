import { type ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getSequelize } from '~/db'

export const getRichnessBySite = async (locationProjectId: number): Promise<ApiMap> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessBySite
    .findAll({
      where: { locationProjectId },
      attributes: ['name', 'latitude', 'longitude', ['richness', 'value'], 'taxonClassId'],
      raw: true
    }) as unknown as ApiMap
