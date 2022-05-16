import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SourceSync } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getSyncs = async (projectId: number): Promise<SourceSync[]> =>
  await ModelRepository.getInstance(getSequelize())
    .SourceSync
    .findAll({
      where: { projectId },
      order: [['updatedAt', 'ASC']],
      raw: true
    })
