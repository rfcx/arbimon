import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections } from '../../_helpers/create-project-with-detections'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject
  )
}

const testProject: Project = {
  id: 10002,
  idCore: 'integration1',
  idArbimon: 10002001,
  slug: 'integration-test-project2',
  name: 'Integration Test Project 2'
}
