// @ts-nocheck
// ignore because `recordedMinutes` is array and array symbol for sequelize is `{}`
import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Project, ProjectVersion, RecordingBySiteHour, Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { taxonSpeciesAndClassForId } from '@/db/seeders/_data/integration/test-taxon-species'

// Mocked project, site, recordings, detections
export const testProject: Project = {
  id: 20001001,
  idCore: 'integration2',
  idArbimon: 20001001,
  slug: 'integration-test-project-20001001',
  name: 'Integration Test Project 2',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

export const testProjectVersion: ProjectVersion = {
  id: 2,
  locationProjectId: 20001001,
  isPublished: true,
  isPublic: true
}

export const testSites: Site[] = [
  {
    id: 20001001,
    idCore: 'testSite0001',
    idArbimon: 2111221,
    locationProjectId: 20001001,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 20001002,
    idCore: 'testSite0002',
    idArbimon: 2111222,
    locationProjectId: 20001001,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    totalDurationInMinutes: 4,
    recordedMinutes: '{7, 9, 11, 13}',
    recordingCount: 4
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 2,
    recordedMinutes: '{45, 47}',
    recordingCount: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 11:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    totalDurationInMinutes: 1,
    recordedMinutes: '{11}',
    recordingCount: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  }
]

export const rawDetectionBySiteSpeciesHour: Array<Omit<DetectionBySiteSpeciesHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    ...taxonSpeciesAndClassForId(100001),
    count: 2,
    durationMinutes: 2,
    detectionMinutes: [7, 9]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100002),
    count: 1,
    durationMinutes: 1,
    detectionMinutes: [55]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100001),
    count: 1,
    durationMinutes: 1,
    detectionMinutes: [11]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100001),
    count: 1,
    durationMinutes: 1,
    detectionMinutes: [1]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    ...taxonSpeciesAndClassForId(100002),
    count: 1,
    durationMinutes: 1,
    detectionMinutes: [17]
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

  // Create summary of mocked hourly validated detections
  try {
    await ModelRepository.getInstance(getSequelize())
      .DetectionBySiteSpeciesHour
      .bulkCreate(rawDetectionBySiteSpeciesHour)
  } catch (err) {
    console.error(err)
  }
}
