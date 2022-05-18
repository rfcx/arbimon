import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectVersion } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10001,
  idCore: 'integration1',
  idArbimon: 133887,
  slug: 'integration-test-project',
  slugArbimon: 'integration-test-project',
  name: 'Integration Test Project'
}

export const testProjectVersion: ProjectVersion = {
  id: 10001,
  projectId: 10001,
  isPublished: true,
  isPublic: true
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)
}
