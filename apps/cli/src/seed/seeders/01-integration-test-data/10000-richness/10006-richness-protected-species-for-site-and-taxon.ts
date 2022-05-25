import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '@/seed/_helpers/create-project-with-detections'

const testProject: Project = {
  id: 10006,
  idCore: 'integration6',
  idArbimon: 10006001,
  slug: 'integration-test-project6',
  name: 'Integration Test Project 6'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10006001,
    idCore: 'ts10006001',
    idArbimon: 10006001,
    name: 'Test Site 6001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10006002,
    idCore: 'ts10006002',
    idArbimon: 10006002,
    name: 'Test Site 6002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10006003,
    idCore: 'ts10006003',
    idArbimon: 10006003,
    name: 'Test Site 6003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: 10006001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-10T11:00:00.000Z'),
    projectSiteId: 10006002,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-12T11:00:00.000Z'),
    projectSiteId: 10006003,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-13T00:00:00.000Z'),
    projectSiteId: 10006003,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-14T00:00:00.000Z'),
    projectSiteId: 10006002,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-16T00:00:00.000Z'),
    projectSiteId: 10006003,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: 10006002,
    taxonSpeciesId: 7,
    taxonClassId: 500,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-18T00:00:00.000Z'),
    projectSiteId: 10006002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: 10006002,
    taxonSpeciesId: 9, // protected
    taxonClassId: 100,
    countDetectionMinutes: 2
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1, // 600
    projectId: 10006,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 5, // 600
    projectId: 10006,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 6, // 100
    projectId: 10006,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 7, // 500
    projectId: 10006,
    riskRatingId: masterRiskRatings.VU.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.VU.code
  },
  {
    taxonSpeciesId: 8, // 300
    projectId: 10006,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 9, // 100
    projectId: 10006,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  }
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
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
