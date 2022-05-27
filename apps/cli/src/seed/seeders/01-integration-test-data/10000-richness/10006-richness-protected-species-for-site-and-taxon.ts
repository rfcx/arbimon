import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSites } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10006
const SCENARIO_NAME = 'Richness Protested Species for Site and Taxon'

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

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1, // 600
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 5, // 600
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
    },
    {
      taxonSpeciesId: 6, // 100
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.EN.id,
      riskRatingCustomCode: masterRiskRatings.EN.code
    },
    {
      taxonSpeciesId: 7, // 500
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.VU.id,
      riskRatingCustomCode: masterRiskRatings.VU.code
    },
    {
      taxonSpeciesId: 8, // 300
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 9, // 100
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    }
  ]
  .map(prr => ({ sourceUrl: '', sourceName: '', ...prr }))

const testSites = Array.from({ length: 3 }, defineTestSites(SCENARIO_ID, SCENARIO_NAME))

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(5), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(5),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-10T11:00:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-12T11:00:00.000Z'),
    projectSiteId: testSites[2].id,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-13T00:00:00.000Z'),
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-14T00:00:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(5),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-16T00:00:00.000Z'),
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(7),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-18T00:00:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  }
]
