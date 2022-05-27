import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSites } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10005
const SCENARIO_NAME = 'Richness Time Bucket'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites,
    testDetectionsByVersionSiteSpeciesHour
  )
}

const testProject = defineTestProject(SCENARIO_ID, SCENARIO_NAME)

const testSites = Array.from({ length: 3 }, defineTestSites(SCENARIO_ID, SCENARIO_NAME))

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-12-31T23:00:00.000Z'), // Friday 31 Dec, 2021 (month end, year end cases)
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Saturday 1 Jan, 2022 (month start, year start cases)
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sunday 2 Jan, 2022 (week start)
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-08T23:00:00.000Z'), // Saturday 8 Jan, 2022 (week end)
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 10
  }
]
