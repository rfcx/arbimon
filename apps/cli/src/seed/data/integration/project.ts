import { Project, ProjectVersion } from '@rfcx-bio/common/dao/types'

// Mocked projects
export const testProject: Project = {
  id: 7,
  idCore: 'integration1',
  idArbimon: 133887,
  slug: 'integration-test-project',
  slugArbimon: 'integration-test-project',
  name: 'Integration Test Project'
}

export const testProject2: Project = {
  id: 8,
  idCore: 'integration2',
  idArbimon: 133888,
  slug: 'integration-test-project2',
  slugArbimon: 'integration-test-project2',
  name: 'Integration Test Project 2'
}

// Mocked versions
export const testProjectVersion: ProjectVersion = {
  id: 7,
  projectId: 7,
  isPublished: true,
  isPublic: true
}

export const testProject2Version: ProjectVersion = {
  id: 8,
  projectId: 8,
  isPublished: true,
  isPublic: true
}
