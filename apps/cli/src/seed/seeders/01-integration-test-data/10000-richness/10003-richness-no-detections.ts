import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, SiteAutoProject } from '../../_helpers/create-project-with-detections'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites
  )
}

const testProject: Project = {
  id: 10003,
  idCore: 'integration1',
  idArbimon: 10003001,
  slug: 'integration-test-project3',
  name: 'Integration Test Project 3'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10003,
    idCore: 'testSite0003',
    idArbimon: 1111223,
    name: 'Test Site 3',
    latitude: 19.31307,
    longitude: -67.24878,
    altitude: 35.85246588
  }
]
