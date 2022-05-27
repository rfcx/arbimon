import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { createProjectWithDetections } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSite } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10003
const SCENARIO_NAME = 'Richness No Detections'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    [testSite]
  )
}

const testProject = defineTestProject(SCENARIO_ID, SCENARIO_NAME)

const testSite = defineTestSite(SCENARIO_ID, SCENARIO_NAME)
