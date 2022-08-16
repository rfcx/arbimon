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
  id: 40001001,
  idCore: 'integration4',
  idArbimon: 40001001,
  slug: 'integration-test-project-40001001',
  name: 'Integration Test Project 4',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

export const testProjectVersion: ProjectVersion = {
  id: 4,
  locationProjectId: 40001001,
  isPublished: true,
  isPublic: true
}

export const testSites: Site[] = [
  {
    id: 40001001,
    idCore: 'testSite0005',
    idArbimon: 2111225,
    locationProjectId: 40001001,
    name: 'Test Site Dashboard Basic',
    latitude: 17.962779,
    longitude: -66.201552,
    altitude: 30.85246588
  },
  {
    id: 40001002,
    idCore: 'testSite0006',
    idArbimon: 2111226,
    locationProjectId: 40001001,
    name: 'Test Site Dashboard Empty',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 40001001,
    locationSiteId: 40001001,
    totalDurationInMinutes: 4,
    recordedMinutes: '{7, 9, 11, 13}',
    recordingCount: 4
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 40001001,
    locationSiteId: 40001001,
    totalDurationInMinutes: 3,
    recordedMinutes: '{11, 14, 17}',
    recordingCount: 3
  }
]

export const rawDetectionBySiteSpeciesHour: Array<Omit<DetectionBySiteSpeciesHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 40001001,
    locationSiteId: 40001001,
    ...taxonSpeciesAndClassForId(100001),
    count: 2,
    durationMinutes: 2,
    detectionMinutes: [7, 9]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 40001001,
    locationSiteId: 40001001,
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
