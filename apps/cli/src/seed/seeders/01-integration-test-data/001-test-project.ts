import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects: Project[] = []

  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)
}
