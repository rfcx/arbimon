import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { createProjectWithDetections, SiteAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject } from '../../_helpers/define-test-project'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites
  )
}

const projectId = 10003001
const siteId1 = 10003001

const testProject = defineTestProject(projectId, 'Richness No Detections')

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'testSite0003',
    idArbimon: siteId1,
    name: 'Test Site 3',
    latitude: 19.31307,
    longitude: -67.24878,
    altitude: 35.85246588
  }
]
