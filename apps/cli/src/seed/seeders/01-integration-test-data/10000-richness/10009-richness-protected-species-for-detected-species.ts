import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'

const testProject: Project = {
  id: 10009,
  idCore: 'integration1',
  idArbimon: 10009001,
  slug: 'integration-test-project9',
  name: 'Integration Test Project 9'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10009001,
    idCore: 'ts10009001',
    idArbimon: 10009001,
    name: 'Test Site 9001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10009002,
    idCore: 'ts10009002',
    idArbimon: 10009002,
    name: 'Test Site 9002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10009003,
    idCore: 'ts10009003',
    idArbimon: 10009003,
    name: 'Test Site 9003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  // same species case
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10009001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009001,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009001,
    taxonSpeciesId: 7,
    taxonClassId: 500,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009002,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009002,
    taxonSpeciesId: 8,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10009003,
    taxonSpeciesId: 8,
    taxonClassId: 300,
    countDetectionMinutes: 2
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1, // 600
    projectId: 10009,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 2, // 100
    projectId: 10009,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 3, // 300
    projectId: 10009,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 4, // 300
    projectId: 10009,
    riskRatingId: masterRiskRatings.VU.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.VU.code
  },
  {
    taxonSpeciesId: 7, // 500
    projectId: 10009,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 5, // 600
    projectId: 10009,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 6, // 100
    projectId: 10009,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 8, // 100
    projectId: 10009,
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
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpeciesProjectRiskRating
    .bulkCreate(testTaxonSpeciesProjectRiskRating)
}
