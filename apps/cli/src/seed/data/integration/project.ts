import { Project } from '@rfcx-bio/common/dao/types'

export const testProject: Omit<Project, 'id'> = {
  idCore: 'integration1',
  idArbimon: 1337,
  slug: 'integration-test-project',
  slugArbimon: 'integration-test-project',
  name: 'Integration Test Project'
}
