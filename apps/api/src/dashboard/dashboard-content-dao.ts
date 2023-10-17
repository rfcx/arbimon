import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getDashboardContent = async (locationProjectId: number): Promise<DashboardContentResponse> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { locationProjectId, summary: '', readme: '' }
