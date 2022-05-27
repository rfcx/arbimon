import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject, defineTestSites } from '../../_helpers/define-test-data'

const SCENARIO_ID = 10007
const SCENARIO_NAME = 'Richness Protested Species for Time Bucket'

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
      taxonSpeciesId: 3, // 300
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
    },
    {
      taxonSpeciesId: 4, // 300
      projectId: testProject.id,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
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
  // Same site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },

  // Same site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(4),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(3),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[0].id,
    ...taxonSpeciesAndClassForId(4),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },

  // Different taxon (100)
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: testSites[1].id,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  },

  // Site with only protected species
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Sat Jan 1640995200
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-03T15:00:00.000Z'), // Mon Jan 1641168000
    projectSiteId: testSites[2].id,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  }
]
