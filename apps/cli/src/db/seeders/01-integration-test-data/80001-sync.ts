import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project, type Site, type SyncLogByProject } from '@rfcx-bio/node-common/dao/types'

// Mocked project, site, recordings, detections
export const testProject: Project = {
  id: 80001001,
  idCore: 'integration8',
  idArbimon: 80001001,
  slug: 'integration-test-project-80001001',
  name: 'Integration Test Project 8',
  status: 'published',
  statusUpdatedAt: new Date(),
  latitudeNorth: 18.3,
  latitudeSouth: 18.4,
  longitudeEast: -65.2,
  longitudeWest: -65.3
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
    altitude: 30.85246588,
    countryCode: 'US'
  },
  {
    id: 80001002,
    idCore: 'testSite0002',
    idArbimon: 8111222,
    locationProjectId: testProject.id,
    name: 'Test Site 2',
    latitude: 18.32567,
    longitude: -65.25421,
    altitude: 20.12366,
    countryCode: 'US'
  }
]

export const testSyncLogProject: Omit<SyncLogByProject, 'createdAt' | 'updatedAt'> = {
  id: 1,
  locationProjectId: testProject.id,
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  delta: 1
}

export const testSyncLogSites: Omit<SyncLogByProject, 'createdAt' | 'updatedAt'> = {
  id: 2,
  locationProjectId: testProject.id,
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Site.id,
  delta: 2
}

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create projects and versions
  const projects: Project[] = [testProject]
  await models.LocationProject.bulkCreate(projects)

  // Create sites
  await models.LocationSite.bulkCreate(testSites)

  // Create sync logs for projects and sites
  const logs: any[] = [testSyncLogProject, testSyncLogSites]
  await models.SyncLogByProject.bulkCreate(logs)
}
