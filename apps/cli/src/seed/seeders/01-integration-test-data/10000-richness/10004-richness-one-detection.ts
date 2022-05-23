import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, Source } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject4: Project = {
  id: 10004,
  idCore: 'integration1',
  idArbimon: 133890,
  slug: 'integration-test-project4',
  name: 'Integration Test Project 4'
}

export const testProjectVersion4: ProjectVersion = {
  id: 10004,
  projectId: 10004,
  isPublished: true,
  isPublic: true
}

export const testSite4: ProjectSite = {
  id: 10004,
  idCore: 'testSite0004',
  idArbimon: 1111224,
  projectId: 10004,
  projectVersionFirstAppearsId: 10004,
  name: 'Test Site 4',
  latitude: 20.31307,
  longitude: -80.24878,
  altitude: 30.85246588
}

export const testSource4: Source = {
  id: 10004,
  name: 'source-test-project-10004'
}

export const testDetectionByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-02-11T11:00:00.000Z'),
  projectVersionId: 10004,
  projectSiteId: 10004,
  taxonSpeciesId: 3,
  taxonClassId: 300,
  countDetectionMinutes: 1
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject4]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion4]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create mocked projects sites
  const sites: ProjectSite[] = [testSite4]
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(sites)

  // Create mocked source
  const source: Source[] = [testSource4]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)

   // Create summary of mocked hourly validated detections
   const detection: DetectionByVersionSiteSpeciesHour[] = [testDetectionByVersionSiteSpeciesHour]
   await ModelRepository.getInstance(getSequelize())
     .DetectionByVersionSiteSpeciesHour
     .bulkCreate(detection)
}
