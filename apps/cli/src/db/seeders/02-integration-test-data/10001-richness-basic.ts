// @ts-nocheck
// ignore because `recordedMinutes` is array and array symbol for sequelize is `{}`
import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectVersion, RecordingBySiteHour, Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'

// Mocked project, site, recordings
export const testProject: Project = {
  id: 10001001,
  idCore: 'integration1',
  idArbimon: 10001001,
  slug: 'integration-test-project-10001001',
  name: 'Integration Test Project 1',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

export const testProjectVersion: ProjectVersion = {
  id: 1,
  locationProjectId: 10001001,
  isPublished: true,
  isPublic: true
}

export const testSites: Site[] = [
  {
    id: 10001001,
    idCore: 'testSite1001',
    idArbimon: 1111219,
    locationProjectId: 10001001,
    name: 'Test Site Richess',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10001002,
    idCore: 'testSite1002',
    idArbimon: 1111220,
    locationProjectId: 10001001,
    name: 'Test Site Richness 2',
    latitude: 28.31307,
    longitude: -60.24878,
    altitude: 10.85246588
  }
]

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 2,
    recordedMinutes: '{7, 9}',
    recordingCount: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 2,
    recordedMinutes: '{45, 47}',
    recordingCount: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  }
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked project
  const projects: Project[] = [testProject]
    await ModelRepository.getInstance(getSequelize())
    .LocationProject
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create mocked project sites
  await ModelRepository.getInstance(getSequelize())
    .LocationSite
    .bulkCreate(testSites)

  // Create mocked recordings
  await ModelRepository.getInstance(getSequelize())
    .RecordingBySiteHour
    .bulkCreate(rawRecordingBySiteHour)
}
