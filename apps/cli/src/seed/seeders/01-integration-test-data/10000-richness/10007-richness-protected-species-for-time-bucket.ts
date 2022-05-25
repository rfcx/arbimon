import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, Source, TaxonSpeciesProjectRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10007,
  idCore: 'integration7',
  idArbimon: 10007001,
  slug: 'integration-test-project7',
  name: 'Integration Test Project 7'
}

const testProjectVersion: ProjectVersion = {
  id: 10007,
  projectId: 10007,
  isPublished: true,
  isPublic: true
}

export const testSites: ProjectSite[] = [
  {
    id: 10007001,
    idCore: 'ts10007001',
    idArbimon: 10007001,
    projectId: 10007,
    projectVersionFirstAppearsId: 10007,
    name: 'Test Site 7001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10007002,
    idCore: 'ts10007002',
    idArbimon: 10007002,
    projectId: 10007,
    projectVersionFirstAppearsId: 10007,
    name: 'Test Site 7002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10007003,
    idCore: 'ts10007003',
    idArbimon: 10007003,
    projectId: 10007,
    projectVersionFirstAppearsId: 10007,
    name: 'Test Site 7003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testSource: Source = {
  id: 10007,
  name: 'source-test-project-10007'
}

const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  // Same site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Same site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007001,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) same species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 8, // protected
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Different site same taxon (300) different species different date same time
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 2
  },

  // Different taxon (100)
  {
    timePrecisionHourLocal: new Date('2021-12-31T00:00:00.000Z'), // Fri Dec
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T23:00:00.000Z'), // Sun Jan
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-06T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T23:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-13T11:00:00.000Z'), // Sun Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 9, // protected
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 6,
    taxonClassId: 100,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-02-15T11:00:00.000Z'), // Tue Feb
    projectVersionId: 10007,
    projectSiteId: 10007002,
    taxonSpeciesId: 9, // protected
    taxonClassId: 100,
    countDetectionMinutes: 2
  },

  // Site with only protected species
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Sat Jan
    projectVersionId: 10007,
    projectSiteId: 10007003,
    taxonSpeciesId: 1, // protected
    taxonClassId: 600,
    countDetectionMinutes: 2
  },
  {
    timePrecisionHourLocal: new Date('2022-01-03T15:00:00.000Z'), // Mon Jan
    projectVersionId: 10007,
    projectSiteId: 10007003,
    taxonSpeciesId: 9, // protected
    taxonClassId: 100,
    countDetectionMinutes: 2
  }
]

const testTaxonSpeciesProjectRiskRating: TaxonSpeciesProjectRiskRating[] = [
  {
    taxonSpeciesId: 1, // 600
    projectId: 10007,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 3, // 300
    projectId: 10007,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 4, // 300
    projectId: 10007,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 5, // 600
    projectId: 10007,
    riskRatingId: masterRiskRatings.LC.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.LC.code
  },
  {
    taxonSpeciesId: 6, // 100
    projectId: 10007,
    riskRatingId: masterRiskRatings.EN.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.EN.code
  },
  {
    taxonSpeciesId: 7, // 500
    projectId: 10007,
    riskRatingId: masterRiskRatings.VU.id,
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.VU.code
  },
  {
    taxonSpeciesId: 8, // 300
    projectId: 10007,
    riskRatingId: masterRiskRatings.CR.id, // protected
    sourceUrl: '',
    sourceName: '',
    riskRatingCustomCode: masterRiskRatings.CR.code
  },
  {
    taxonSpeciesId: 9, // 100
    projectId: 10007,
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
