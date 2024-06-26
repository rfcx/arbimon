import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type Project, type RecordingBySiteHour, type Site } from '@rfcx-bio/node-common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

// Mocked project, site, recordings
export const testProject: Project = {
  id: 10001001,
  idCore: 'integration1',
  idArbimon: 10001001,
  slug: 'integration-test-project-10001001',
  name: 'Integration Test Project 1',
  status: 'published',
  statusUpdatedAt: new Date(),
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
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
    altitude: 30.85246588,
    countryCode: 'US'
  },
  {
    id: 10001002,
    idCore: 'testSite1002',
    idArbimon: 1111220,
    locationProjectId: 10001001,
    name: 'Test Site Richness 2',
    latitude: 28.31307,
    longitude: -60.24878,
    altitude: 10.85246588,
    countryCode: 'US'
  }
]

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 2,
    countsByMinute: [[7, 1], [9, 1]],
    count: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 2,
    countsByMinute: [[45, 1], [47, 1]],
    count: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001002,
    totalDurationInMinutes: 1,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: 10001001,
    locationSiteId: 10001001,
    totalDurationInMinutes: 3,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  }
]

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mocked project
  const projects: Project[] = [testProject]
  await models.LocationProject.bulkCreate(projects)

  // Create mocked project sites
  await models.LocationSite.bulkCreate(testSites)

  // Create mocked recordings
  await models.RecordingBySiteHour
    .bulkCreate(rawRecordingBySiteHour.map(r => literalizeCountsByMinute(r, sequelize)))
}
