import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getDashboardContent = async (locationProjectId: number): Promise<LocationProjectProfile> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { locationProjectId, summary: '', readme: '' }
