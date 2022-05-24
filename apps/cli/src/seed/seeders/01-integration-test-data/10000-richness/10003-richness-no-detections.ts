import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectSite, ProjectVersion, Source } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject3: Project = {
  id: 10003,
  idCore: 'integration1',
  idArbimon: 10003001,
  slug: 'integration-test-project3',
  name: 'Integration Test Project 3'
}

export const testProjectVersion3: ProjectVersion = {
  id: 10003,
  projectId: 10003,
  isPublished: true,
  isPublic: true
}

export const testSite3: ProjectSite = {
  id: 10003,
  idCore: 'testSite0003',
  idArbimon: 1111223,
  projectId: 10003,
  projectVersionFirstAppearsId: 10003,
  name: 'Test Site 3',
  latitude: 19.31307,
  longitude: -67.24878,
  altitude: 35.85246588
}

export const testSource3: Source = {
  id: 10003,
  name: 'source-test-project-10003'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject3]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion3]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create mocked projects sites
  const sites: ProjectSite[] = [testSite3]
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(sites)

  // Create mocked source
  const source: Source[] = [testSource3]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)
}
