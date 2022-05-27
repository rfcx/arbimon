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

const projectId = 10006001
const siteId1 = 10006001
const siteId2 = 10006002
const siteId3 = 10006003

const testProject = defineTestProject(projectId, 'Richness Protested Species for Site and Taxon')

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] =
  [
    {
      taxonSpeciesId: 1, // 600
      projectId,
      riskRatingId: masterRiskRatings.CR.id, // protected
      riskRatingCustomCode: masterRiskRatings.CR.code
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
    idCore: 'ts10006001',
    idArbimon: siteId1,
    name: 'Test Site 6001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId2,
    idCore: 'ts10006002',
    idArbimon: siteId2,
    name: 'Test Site 6002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId3,
    idCore: 'ts10006003',
    idArbimon: siteId3,
    name: 'Test Site 6003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(5), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(5),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-10T11:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-12T11:00:00.000Z'),
    projectSiteId: siteId3,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-13T00:00:00.000Z'),
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(1), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-14T00:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(5),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-16T00:00:00.000Z'),
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(6),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(7),
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-18T00:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(8), // protected
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(9), // protected
    countDetectionMinutes: 2
  }
]
