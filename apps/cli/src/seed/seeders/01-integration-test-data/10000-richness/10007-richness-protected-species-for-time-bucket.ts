import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject } from '../../_helpers/define-test-project'

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

const projectId = 10007001
const siteId1 = 10007001
const siteId2 = 10007002
const siteId3 = 10007003

const testProject = defineTestProject(projectId, 'Richness Protested Species for Time Bucket')

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1, // 600
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 3, // 300
      projectId,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
    },
    {
      taxonSpeciesId: 4, // 300
      projectId,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
    },
    {
      taxonSpeciesId: 5, // 600
      projectId,
      riskRatingId: masterRiskRatings.LC.id,
      riskRatingCustomCode: masterRiskRatings.LC.code
    },
    {
      taxonSpeciesId: 6, // 100
      projectId,
      riskRatingId: masterRiskRatings.EN.id,
      riskRatingCustomCode: masterRiskRatings.EN.code
    },
    {
      taxonSpeciesId: 7, // 500
      projectId,
      riskRatingId: masterRiskRatings.VU.id,
      riskRatingCustomCode: masterRiskRatings.VU.code
    },
    {
      taxonSpeciesId: 8, // 300
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 9, // 100
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
    }
  ]
  .map(prr => ({ sourceUrl: '', sourceName: '', ...prr }))

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'ts10007001',
    idArbimon: siteId1,
    name: 'Test Site 7001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId2,
    idCore: 'ts10007002',
    idArbimon: siteId2,
    name: 'Test Site 7002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId3,
    idCore: 'ts10007003',
    idArbimon: siteId3,
    name: 'Test Site 7003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  // Same site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },

  // Same site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(4),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(3),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(4),
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },

  // Different taxon (100)
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec 1640908800
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan 1641081600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb 1644105600
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb 1644710400
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb 1644883200
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  },

  // Site with only protected species
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Sat Jan 1640995200
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-03T15:00:00.000Z'), // Mon Jan 1641168000
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  }
]
