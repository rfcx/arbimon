import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '@/seed/_helpers/create-project-with-detections'

const testProject: Project = {
  id: 10001,
  idCore: 'integration1',
  idArbimon: 10001001,
  slug: 'integration-test-project1',
  name: 'Integration Test Project 1'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10001001,
    idCore: 'testSite0001',
    idArbimon: 1111221,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10001002,
    idCore: 'testSite0002',
    idArbimon: 1111222,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10001001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: 10001002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: 10001002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1,
    projectId: 10001,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 2,
    projectId: 10001,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 3,
    projectId: 10001,
    riskRatingId: masterRiskRatings.CR.id, // protected species
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 4,
    projectId: 10001,
    riskRatingId: masterRiskRatings.CR.id, // protected species
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
