import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testProject } from '@/seed/data/integration/project'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects: Array<Omit<Project, 'id'>> = [testProject]

  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)
}
