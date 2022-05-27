import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSites } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10001
const SCENARIO_NAME = 'Richness Basic'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites,
    testDetectionsByVersionSiteSpeciesHour
  )

  // Create project risk ratings
  await models.TaxonSpeciesProjectRiskRating.bulkCreate(testTaxonSpeciesProjectRiskRating)
}

const testProject = defineTestProject(SCENARIO_ID, SCENARIO_NAME)

const testSites = Array.from({ length: 2 }, defineTestSites(SCENARIO_ID, SCENARIO_NAME))

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1,
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 2,
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 3,
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.CR.id, // protected species
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 4,
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.CR.id, // protected species
      riskRatingCustomCode: masterRiskRatings.CR.code
    }
  ]
  .map(prr => ({ sourceUrl: '', sourceName: '', ...prr }))
