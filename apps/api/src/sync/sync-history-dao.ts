import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DataSource } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getSyncs = async (projectId: number): Promise<DataSource[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DataSource
    .findAll({
      attributes: ['id', ['created_at', 'createdAt'], ['updated_at', 'updatedAt'], ['summary_text', 'summaryText']],
      where: { locationProjectId: projectId },
      order: [['updatedAt', 'ASC']]
    })
