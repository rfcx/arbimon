import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10001,
  idCore: 'integration1',
  idArbimon: 10001001,
  slug: 'integration-test-project1',
  name: 'Integration Test Project 1'
}

export const testProjectVersion: ProjectVersion = {
  id: 10001,
  projectId: 10001,
  isPublished: true,
  isPublic: true
}

export const testProjectVersion2: ProjectVersion = {
  id: 10002,
  projectId: 10001001,
  isPublished: true,
  isPublic: true
}

export const testSites: ProjectSite[] = [
  {
    id: 10001001,
    idCore: 'testSite0001',
    idArbimon: 1111221,
    projectId: 10001,
    projectVersionFirstAppearsId: 10001,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10001002,
    idCore: 'testSite0002',
    idArbimon: 1111222,
    projectId: 10001,
    projectVersionFirstAppearsId: 10001,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const testSource: any = {
  id: 10001,
  name: 'source-test-project-10001'
}

export const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    projectVersionId: 10001,
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
