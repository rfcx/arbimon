import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour, DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, Source } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10001,
  idCore: 'integration1',
  idArbimon: 133887,
  slug: 'integration-test-project',
  slugArbimon: 'integration-test-project',
  name: 'Integration Test Project'
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

export const testSite: ProjectSite = {
  id: 10001001,
  idCore: 'testSite0001',
  idArbimon: 1111221,
  projectId: 10001,
  projectVersionFirstAppearsId: 10001,
  name: 'Test Site',
  latitude: 18.31307,
  longitude: -65.24878,
  altitude: 30.85246588
}

export const testSite2: ProjectSite = {
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

export const testSource: Source = {
  id: 10001,
  name: 'source-test-project-10001'
}

export const testDetectionBySourceSiteSpeciesHour: DetectionBySourceSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
  sourceId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 1,
  detectionMinutes: '10'
}

export const testDetectionBySourceSiteSpeciesHour2: DetectionBySourceSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
  sourceId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 2,
  detectionMinutes: '10'
}

export const testDetectionBySourceSiteSpeciesHour3: DetectionBySourceSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
  sourceId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 2,
  detectionMinutes: '10'
}

export const testDetectionBySourceSiteSpeciesHour4: DetectionBySourceSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
  sourceId: 10001,
  projectSiteId: 10001002,
  taxonSpeciesId: 3,
  detectionMinutes: '10'
}

export const testDetectionByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
  projectVersionId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 1,
  taxonClassId: 600,
  countDetectionMinutes: 10
}

export const testDetectionByVersionSiteSpeciesHour2: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
  projectVersionId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 2,
  taxonClassId: 100,
  countDetectionMinutes: 10
}

export const testDetectionByVersionSiteSpeciesHour3: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
  projectVersionId: 10001,
  projectSiteId: 10001001,
  taxonSpeciesId: 2,
  taxonClassId: 100,
  countDetectionMinutes: 10
}

export const testDetectionByVersionSiteSpeciesHour4: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
  projectVersionId: 10001,
  projectSiteId: 10001002,
  taxonSpeciesId: 3,
  taxonClassId: 300,
  countDetectionMinutes: 10
}

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
  const sites: ProjectSite[] = [testSite, testSite2]
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(sites)

  // Create mocked source
  const source: Source[] = [testSource]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)

  // Create summary of mocked validated detections
  const detectionBySource: DetectionBySourceSiteSpeciesHour[] = [
    testDetectionBySourceSiteSpeciesHour,
    testDetectionBySourceSiteSpeciesHour2,
    testDetectionBySourceSiteSpeciesHour3,
    testDetectionBySourceSiteSpeciesHour4
  ]
  await ModelRepository.getInstance(getSequelize())
    .DetectionBySourceSiteSpeciesHour
    .bulkCreate(detectionBySource)

   // Create summary of mocked hourly validated detections
   const detection: DetectionByVersionSiteSpeciesHour[] = [
      testDetectionByVersionSiteSpeciesHour,
      testDetectionByVersionSiteSpeciesHour2,
      testDetectionByVersionSiteSpeciesHour3,
      testDetectionByVersionSiteSpeciesHour4
    ]
   await ModelRepository.getInstance(getSequelize())
     .DetectionByVersionSiteSpeciesHour
     .bulkCreate(detection)
}
