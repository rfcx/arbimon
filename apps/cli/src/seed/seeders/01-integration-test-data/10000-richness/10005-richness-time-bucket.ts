import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
const testProject: Project = {
  id: 10005,
  idCore: 'integration5',
  idArbimon: 10005001,
  slug: 'integration-test-project5',
  name: 'Integration Test Project 5'
}

const testProjectVersion: ProjectVersion = {
  id: 10005,
  projectId: 10005,
  isPublished: true,
  isPublic: true
}

const testSites: ProjectSite[] = [
  {
    id: 10005001,
    idCore: 'ts10005001',
    idArbimon: 1111225,
    projectId: 10005,
    projectVersionFirstAppearsId: 10005,
    name: 'Test Site 5001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10005002,
    idCore: 'ts10005002',
    idArbimon: 1111226,
    projectId: 10005,
    projectVersionFirstAppearsId: 10005,
    name: 'Test Site 5002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10005003,
    idCore: 'ts10005003',
    idArbimon: 1111227,
    projectId: 10005,
    projectVersionFirstAppearsId: 10005,
    name: 'Test Site 5003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-12-31T23:00:00.000Z'), // Friday 31 Dec, 2021 (month end, year end cases)
    projectVersionId: 10005,
    projectSiteId: 10005001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Saturday 1 Jan, 2022 (month start, year start cases)
    projectVersionId: 10005,
    projectSiteId: 10005001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sunday 2 Jan, 2022 (week start)
    projectVersionId: 10005,
    projectSiteId: 10005002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-08T23:00:00.000Z'), // Saturday 8 Jan, 2022 (week end)
    projectVersionId: 10005,
    projectSiteId: 10005003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectVersionId: 10005,
    projectSiteId: 10005003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectVersionId: 10005,
    projectSiteId: 10005003,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 10
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

   // Create summary of mocked hourly validated detections
   await ModelRepository.getInstance(getSequelize())
     .DetectionByVersionSiteSpeciesHour
     .bulkCreate(testDetectionsByVersionSiteSpeciesHour)
}
