import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectVersion } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject2: Project = {
  id: 10002,
  idCore: 'integration1',
  idArbimon: 133888,
  slug: 'integration-test-project2',
  slugArbimon: 'integration-test-project2',
  name: 'Integration Test Project 2'
}

export const testProjectVersion2: ProjectVersion = {
  id: 10002,
  projectId: 10002,
  isPublished: true,
  isPublic: true
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject2]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion2]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)
}
