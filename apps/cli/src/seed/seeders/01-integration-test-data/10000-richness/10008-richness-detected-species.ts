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

const projectId = 10008001
const siteId1 = 10008001
const siteId2 = 10008002
const siteId3 = 10008003

const testProject = defineTestProject(projectId, 'Richness Detected Species')

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1, // 600
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 2, // 100
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 3, // 300
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 4, // 300
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 7, // 500
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    }
  ]
  .map(prr => ({ sourceUrl: '', sourceName: '', ...prr }))

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'ts10008001',
    idArbimon: siteId1,
    name: 'Test Site 8001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId2,
    idCore: 'ts10008002',
    idArbimon: siteId2,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId3,
    idCore: 'ts10008003',
    idArbimon: siteId3,
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
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(7),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-02-17T11:00:00.000Z'),
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 2
  }
]
