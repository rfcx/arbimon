import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectVersion } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testProject, testProject2, testProject2Version, testProjectVersion } from '@/seed/data/integration/project' // testEmptyProject, testEmptySlugArbimonProject, testEmptySlugProject

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject, testProject2]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion, testProject2Version]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)
}
