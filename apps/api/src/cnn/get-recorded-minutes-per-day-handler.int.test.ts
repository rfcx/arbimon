import dayjs from 'dayjs'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type Site } from '@rfcx-bio/node-common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { getSequelize } from '~/db'
import { routesCnn } from './index'

const sequelize = getSequelize()
const { LocationProject, LocationSite, RecordingBySiteHour } = modelRepositoryWithElevatedPermissions

const projectId = 193948
const siteId = 9485034
const siteId2 = 8448223

const project = makeProject(projectId, 'Birmingham birds in the wilds', 'unlisted')
const site: Site = {
  id: siteId,
  idCore: 'kdimbk958lf0',
  idArbimon: 9485037,
  name: 'BM01',
  locationProjectId: 193948,
  latitude: 52.52774830800324,
  longitude: -1.9453590024273757,
  altitude: 200,
  countryCode: 'UK'
}

const site2: Site = {
  id: siteId2,
  idCore: '9rm59g294k4g',
  idArbimon: 94958541,
  name: 'BMW',
  locationProjectId: 193948,
  latitude: 52.52774830800324,
  longitude: -1.94535938485803,
  altitude: 200,
  countryCode: 'UK'
}

beforeAll(async () => {
  await LocationProject.create(project)
  await LocationSite.bulkCreate([site, site2])

  // added 480 minutes of recordings to the table as 2 days, 240 minutes per day
  await RecordingBySiteHour.bulkCreate(Array.from({ length: 48 }, (_, i) => {
    return {
      timePrecisionHourLocal: dayjs('2022-01-01T00:00:00.000+0000').add(i, 'hour').toDate(),
      locationProjectId: projectId,
      locationSiteId: siteId,
      count: 5,
      countsByMinute: literalizeCountsByMinute({
        countsByMinute: [
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1]
        ]
      }, sequelize).countsByMinute,
      totalDurationInMinutes: 10
    }
  }))

  // added random 10 minutes of recordings on 2022-09-01
  await RecordingBySiteHour.create({
    timePrecisionHourLocal: dayjs('2022-09-01T00:00:00.000+0000').toDate(),
    locationProjectId: projectId,
    locationSiteId: siteId2,
    count: 5,
    countsByMinute: literalizeCountsByMinute({
      countsByMinute: [
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1]
      ]
    }, sequelize).countsByMinute,
    totalDurationInMinutes: 10
  })
})

afterAll(async () => {
  await RecordingBySiteHour.destroy({ where: { locationProjectId: projectId }, force: true })
  await LocationSite.destroy({ where: { locationProjectId: projectId }, force: true })
  await LocationProject.destroy({ where: { id: projectId }, force: true })
})

describe('GET /projects/:projectId/recordings-per-day', async () => {
  test('successfully get the correct data', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi1219@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()

    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveProperty('[0].date', '2022-01-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[1].date', '2022-01-02')
    expect(json).toHaveProperty('[1].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[2].date', '2022-09-01')
    expect(json).toHaveProperty('[2].recordedMinutesCount', 10)
  })

  test('non rfcx email will get 403 instead', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi1219@williams.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`
    })

    expect(response.statusCode).toEqual(403)
  })

  test('the response gets updated when there is an update to recording_by_site_hour table', async () => {
    // Arrange
    await RecordingBySiteHour.create({
      timePrecisionHourLocal: dayjs('2022-05-01T00:00:00.000+0000').toDate(),
      locationProjectId: projectId,
      locationSiteId: siteId,
      count: 5,
      countsByMinute: literalizeCountsByMinute({
        countsByMinute: [
          [10, 1],
          [20, 1],
          [30, 1],
          [40, 1],
          [50, 1]
        ]
      }, sequelize).countsByMinute,
      totalDurationInMinutes: 12.55
    })

    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi1219@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`
    })

    // Assert
    expect(response.statusCode).toEqual(200)

    const json = response.json<Array<{ date: string, recordedMinutesCount: number }>>()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    const index = json.findIndex(d => d.date === '2022-05-01')
    expect(index).not.toEqual(-1)
    expect(json[index].recordedMinutesCount).toEqual(12.55)
  })

  test('when the recording is removed, the result will be updated', async () => {
    // Arrange
    await RecordingBySiteHour.destroy({
      where: {
        timePrecisionHourLocal: dayjs('2022-05-01T00:00:00.000+0000').toDate(),
        locationProjectId: projectId,
        locationSiteId: siteId
      }
    })

    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(3)
    expect(json).toHaveProperty('[0].date', '2022-01-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[1].date', '2022-01-02')
    expect(json).toHaveProperty('[1].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[2].date', '2022-09-01')
    expect(json).toHaveProperty('[2].recordedMinutesCount', 10)
  })

  test('when `start` is specified, query anything after the start date', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        start: '2022-08-30'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(1)
    expect(json).toHaveProperty('[0].date', '2022-09-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 10)
  })

  test('when `end` is specified, query anything before the end date', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        end: '2022-01-03'
      }
    })

    // Assert
    const json = response.json()
    expect(response.statusCode).toEqual(200)
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(2)
    expect(json).toHaveProperty('[0].date', '2022-01-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[1].date', '2022-01-02')
    expect(json).toHaveProperty('[1].recordedMinutesCount', 240)
  })

  test('when both `start` and `end` is specified, query anything between the range', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        start: '2022-08-01',
        end: '2022-10-01'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(1)
    expect(json).toHaveProperty('[0].date', '2022-09-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 10)
  })

  test('invalid start date will result in no start date specified', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        start: 'what',
        end: '2022-10-08'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(3)
    expect(json).toHaveProperty('[0].date', '2022-01-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 240)
    expect(json).toHaveProperty('[2].date', '2022-09-01')
  })

  test('when `sites` are specified, only query recordings from given sites', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        sites: 'BMW'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(1)
    expect(json).toHaveProperty('[0].date', '2022-09-01')
    expect(json).toHaveProperty('[0].recordedMinutesCount', 10)
  })

  test('combination of `sites`, `start`, and `end` works together', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        sites: 'BMW',
        start: '2022-05-01',
        end: '2022-06-01'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveLength(0)
  })

  test('errors when `end` is greater than `start`', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'nicholaslatifi2120@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/recordings-per-day`,
      query: {
        sites: 'BMW',
        end: '2022-05-01',
        start: '2022-06-01'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    expect(response.json().message).toContain('greater')
  })
})
