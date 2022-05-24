import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 20001001,
  idCore: 'integration2',
  idArbimon: 20001001,
  slug: 'integration-test-project-20001001',
  name: 'Integration Test Project 2'
}

export const testProjectVersion: ProjectVersion = {
  id: 2,
  projectId: 20001001,
  isPublished: true,
  isPublic: true
}

export const testSites: ProjectSite[] = [
  {
    id: 20001001,
    idCore: 'testSite0001',
    idArbimon: 2111221,
    projectId: 20001001,
    projectVersionFirstAppearsId: 2,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 20001002,
    idCore: 'testSite0002',
    idArbimon: 2111222,
    projectId: 20001001,
    projectVersionFirstAppearsId: 2,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const testSource: any = {
  id: 20001,
  name: 'source-test-project-20001'
}

export const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-23T11:00:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-24T11:00:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-25T11:11:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-03-25T11:11:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-03-26T11:11:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 3
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectVersionId: 2,
    projectSiteId: 20001001,
    taxonSpeciesId: 5,
    taxonClassId: 600,
    countDetectionMinutes: 1
  },
  {
    timePrecisionHourLocal: new Date('2021-01-27T14:00:00.000Z'),
    projectVersionId: 2,
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
  try {
    await ModelRepository.getInstance(getSequelize())
      .DetectionByVersionSiteSpeciesHour
      .bulkCreate(testDetectionsByVersionSiteSpeciesHour)
  } catch (errr) {
    console.error('\n\n--------errr--------', errr)
  }

  // Create summary of mocked hourly validated detections
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpeciesProjectRiskRating
    .bulkCreate(testTaxonSpeciesProjectRiskRating)
}
