import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSite } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10004
const SCENARIO_NAME = 'Richness One Detection'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    [testSite],
    testDetectionsByVersionSiteSpeciesHour
  )
}

const testProject = defineTestProject(SCENARIO_ID, SCENARIO_NAME)

const testSite = defineTestSite(SCENARIO_ID, SCENARIO_NAME)

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-02-11T11:00:00.000Z'),
    projectSiteId: testSite.id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 1
  }
]
