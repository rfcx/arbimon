import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, Source, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10006,
  idCore: 'integration6',
  idArbimon: 10006001,
  slug: 'integration-test-project6',
  name: 'Integration Test Project 6'
}

const testProjectVersion: ProjectVersion = {
  id: 10006,
  projectId: 10006,
  isPublished: true,
  isPublic: true
}

export const testSites: ProjectSite[] = [
  {
    id: 10006001,
    idCore: 'ts10006001',
    idArbimon: 10006001,
    projectId: 10006,
    projectVersionFirstAppearsId: 10006,
    name: 'Test Site 6001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10006002,
    idCore: 'ts10006002',
    idArbimon: 10006002,
    projectId: 10006,
    projectVersionFirstAppearsId: 10006,
    name: 'Test Site 6002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10006003,
    idCore: 'ts10006003',
    idArbimon: 10006003,
    projectId: 10006,
    projectVersionFirstAppearsId: 10006,
    name: 'Test Site 6003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testSource: Source = {
  id: 10006,
  name: 'source-test-project-10006'
}

const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-20T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-10T11:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006002,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-12T11:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006003,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-13T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006003,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-14T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006002,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-16T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006003,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-18T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006002,
    taxonSpeciesId: 9, // protected
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-19T00:00:00.000Z'),
    projectVersionId: 10006,
    projectSiteId: 10006002,
    taxonSpeciesId: 7,
    taxonClassId: 500,
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
  // Create mocked projects
  const projects: Project[] = [testProject]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create mocked projects sites
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(testSites)

  // Create mocked source
  const source: [any] = [testSource]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)

  // Create summary of mocked hourly validated detections
  await ModelRepository.getInstance(getSequelize())
    .DetectionByVersionSiteSpeciesHour
    .bulkCreate(testDetectionsByVersionSiteSpeciesHour)

  // Create summary of mocked hourly validated detections
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpeciesProjectRiskRating
    .bulkCreate(testTaxonSpeciesProjectRiskRating)
}
