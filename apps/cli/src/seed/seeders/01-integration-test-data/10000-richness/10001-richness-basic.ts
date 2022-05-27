import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

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

const projectId = 10001001
const siteId1 = 10001001
const siteId2 = 10001002

const testProject: Project = defineTestProject(projectId, 'Richness Basic')

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'testSite0001',
    idArbimon: siteId1,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId2,
    idCore: 'testSite0002',
    idArbimon: siteId2,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 1
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1,
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 2,
      projectId,
      riskRatingId: masterRiskRatings.DD.id,
      riskRatingCustomCode: masterRiskRatings.DD.code
    },
    {
      taxonSpeciesId: 3,
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected species
      riskRatingCustomCode: masterRiskRatings.CR.code
    },
    {
      taxonSpeciesId: 4,
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected species
      riskRatingCustomCode: masterRiskRatings.CR.code
    }
  ]
  .map(prr => ({ sourceUrl: '', sourceName: '', ...prr }))
