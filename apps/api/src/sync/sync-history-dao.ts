import { Sync } from '@rfcx-bio/common/api-bio/sync'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getSyncs = async (projectId: number): Promise<Sync[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DataSource
    .findAll({
      attributes: ['id', ['created_at', 'createdAt'], ['updated_at', 'updatedAt'], ['summary_text', 'summaryText']],
      where: { locationProjectId: projectId },
      order: [['updatedAt', 'DESC']]
    }) as unknown as Sync[]
