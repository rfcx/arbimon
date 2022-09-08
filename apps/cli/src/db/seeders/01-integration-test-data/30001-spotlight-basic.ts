import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour, Project, ProjectVersion, RecordingBySiteHour, Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { taxonSpeciesAndClassForId } from '@/db/seeders/_data/integration/test-taxon-species'
import { literalizeCountsByMinute } from '../_helpers/sequelize-literal-integer-array-2d'

// Mocked project, site, recordings, detections
export const testProject: Project = {
  id: 30001001,
  idCore: 'integration3',
  idArbimon: 30001001,
  slug: 'integration-test-project-30001001',
  name: 'Integration Test Project 3',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

export const testProjectVersion: ProjectVersion = {
  id: 3,
  locationProjectId: 30001001,
  isPublished: true,
  isPublic: true
}

export const testSites: Site[] = [
  {
    id: 30001001,
    idCore: 'testSite0003',
    idArbimon: 2111223,
    locationProjectId: 30001001,
    name: 'Test Site 3',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 30001002,
    idCore: 'testSite0004',
    idArbimon: 2111224,
    locationProjectId: 30001001,
    name: 'Test Site 4',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001001,
    totalDurationInMinutes: 4,
    countsByMinute: [[7, 1], [9, 1], [11, 1], [13, 1]],
    count: 4
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 2,
    countsByMinute: [[45, 1], [47, 1]],
    count: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 11:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 30001001,
    locationSiteId: 30001001,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  }
]

export const rawDetectionBySiteSpeciesHour: Array<Omit<DetectionBySiteSpeciesHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    ...taxonSpeciesAndClassForId(100001),
    count: 2,
    countsByMinute: [[7, 1], [9, 1]]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100002),
    count: 1,
    countsByMinute: [[55, 1]]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100001),
    count: 1,
    countsByMinute: [[11, 1]]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001002,
    ...taxonSpeciesAndClassForId(100001),
    count: 1,
    countsByMinute: [[1, 1]]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 20001001,
    locationSiteId: 20001001,
    ...taxonSpeciesAndClassForId(100002),
    count: 1,
    countsByMinute: [[17, 1]]
  }
]

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mocked project
  const projects: Project[] = [testProject]
  await models.LocationProject.bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await models.ProjectVersion.bulkCreate(projectsVersions)

  // Create mocked project sites
  await models.LocationSite.bulkCreate(testSites)

  // Create mocked recordings
  await models.RecordingBySiteHour
    .bulkCreate(rawRecordingBySiteHour.map(r => literalizeCountsByMinute(r, sequelize)))

  // Create summary of mocked hourly validated detections
  await models.DetectionBySiteSpeciesHour
    .bulkCreate(rawDetectionBySiteSpeciesHour.map(r => literalizeCountsByMinute(r, sequelize)))
}
