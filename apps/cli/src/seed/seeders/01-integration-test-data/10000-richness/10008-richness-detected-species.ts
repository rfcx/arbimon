import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'

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

const testProject: Project = {
  id: 10008,
  idCore: 'integration1',
  idArbimon: 10008001,
  slug: 'integration-test-project8',
  name: 'Integration Test Project 8'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10008001,
    idCore: 'ts10008001',
    idArbimon: 10008001,
    name: 'Test Site 8001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10008002,
    idCore: 'ts10008002',
    idArbimon: 10008002,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10008003,
    idCore: 'ts10008003',
    idArbimon: 10008003,
    name: 'Test Site 8003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  // same species case
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10008001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008001,
    taxonSpeciesId: 7,
    taxonClassId: 500,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008002,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: 10008003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1, // 600
    projectId: 10008,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 2, // 100
    projectId: 10008,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 3, // 300
    projectId: 10008,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 4, // 300
    projectId: 10008,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 7, // 500
    projectId: 10008,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  }
]
