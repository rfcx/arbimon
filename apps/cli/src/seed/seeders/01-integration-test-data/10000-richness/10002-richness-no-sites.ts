import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections } from '../../_helpers/create-project-with-detections'

const testProject: Project = {
  id: 10002,
  idCore: 'integration1',
  idArbimon: 10002001,
  slug: 'integration-test-project2',
  name: 'Integration Test Project 2'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject
  )
}
