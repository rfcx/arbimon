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
  idArbimon: 133892,
  slug: 'integration-test-project',
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
    idArbimon: 1111228,
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
    idArbimon: 1111229,
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
    idArbimon: 1111230,
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
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'), // Wed
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'), // Wed
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Sat
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sun
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sun
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sun
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sun
    projectVersionId: 10006,
    projectSiteId: 10006001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 2
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1,
    projectId: 10006,
    riskRatingId: masterRiskRatings.CR.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 5,
    projectId: 10006,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 6,
    projectId: 10006,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 7,
    projectId: 10006,
    riskRatingId: masterRiskRatings.VU.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.VU.code
  },
  {
    taxonSpeciesId: 8,
    projectId: 10006,
    riskRatingId: masterRiskRatings.CR.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 9,
    projectId: 10006,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
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
