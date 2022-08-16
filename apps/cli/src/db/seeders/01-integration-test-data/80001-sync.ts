// @ts-nocheck
// ignore because `recordedMinutes` is array and array symbol for sequelize is `{}`
import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectVersion, Site, SyncLogByProject } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked project, site, recordings, detections
export const testProject: Project = {
  id: 80001001,
  idCore: 'integration8',
  idArbimon: 80001001,
  slug: 'integration-test-project-80001001',
  name: 'Integration Test Project 8',
  latitudeNorth: 18.3,
  latitudeSouth: 18.4,
  longitudeEast: -65.2,
  longitudeWest: -65.3
}

export const testProjectVersion: ProjectVersion = {
  id: 8,
  locationProjectId: testProject.id,
  isPublished: true,
  isPublic: true
}

export const testSites: Site[] = [
  {
    id: 80001001,
    idCore: 'testSite0001',
    idArbimon: 8111221,
    locationProjectId: testProject.id,
    name: 'Test Site 1',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 80001002,
    idCore: 'testSite0002',
    idArbimon: 8111222,
    locationProjectId: testProject.id,
    name: 'Test Site 2',
    latitude: 18.32567,
    longitude: -65.25421,
    altitude: 20.12366
  }
]

export const testSyncLogProject: SyncLogByProject = {
  id: 1,
  locationProjectId: testProject.id,
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  delta: 1
}

export const testSyncLogSites: SyncLogByProject = {
  id: 2,
  locationProjectId: testProject.id,
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Site.id,
  delta: 2
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create projects and versions
  const projects: Project[] = [testProject]
    await ModelRepository.getInstance(getSequelize())
    .LocationProject
    .bulkCreate(projects)
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create sites
  await ModelRepository.getInstance(getSequelize())
    .LocationSite
    .bulkCreate(testSites)

  // Create sync logs for projects and sites
  const logs: [any] = [testSyncLogProject, testSyncLogSites]
  await ModelRepository.getInstance(getSequelize())
    .SyncLogByProject
    .bulkCreate(logs)
}
