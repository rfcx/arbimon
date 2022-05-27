import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'

const testProject: Project = {
  id: 20001001,
  idCore: 'integration2',
  idArbimon: 20001001,
  slug: 'integration-test-project-20001001',
  name: 'Integration Test Project 2'
}

const testSites: SiteAutoProject[] = [
  {
    id: 20001001,
    idCore: 'testSite0001',
    idArbimon: 2111221,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 20001002,
    idCore: 'testSite0002',
    idArbimon: 2111222,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-23T11:00:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-24T11:00:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-25T11:11:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-25T11:11:00.000Z'),
    projectSiteId: 20001002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-26T11:11:00.000Z'),
    projectSiteId: 20001002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 3
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectSiteId: 20001001,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 1
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1,
    projectId: 20001001,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 2,
    projectId: 20001001,
    riskRatingId: masterRiskRatings.DD.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.DD.code
  },
  {
    taxonSpeciesId: 3,
    projectId: 20001001,
    riskRatingId: masterRiskRatings.CR.id, // protected species
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 4,
    projectId: 20001001,
    riskRatingId: masterRiskRatings.CR.id, // protected species
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 5,
    projectId: 20001001,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 6,
    projectId: 20001001,
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
  await models.TaxonSpeciesProjectRiskRating.bulkCreate(testTaxonSpeciesProjectRiskRating)
}
