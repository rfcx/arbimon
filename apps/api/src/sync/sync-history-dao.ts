import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SourceSync } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getSyncs = async (projectId: number): Promise<SourceSync[]> =>
  await ModelRepository.getInstance(getSequelize())
    .SourceSync
    .findAll({
      attributes: ['id', ['created_at', 'createdAt'], ['updated_at', 'updatedAt'], ['summary_text', 'summaryText']],
      where: { projectId },
      order: [['updatedAt', 'DESC']]
    })
