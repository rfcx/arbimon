import dayjs from 'dayjs'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { literalizeCountsByMinute } from '@rfcx-bio/common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type Site } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { getSequelize } from '~/db'
import { routesCnn } from './index'

const sequelize = getSequelize()
const { LocationProject, LocationSite, RecordingBySiteHour } = modelRepositoryWithElevatedPermissions

const projectId = 193948
const siteId = 9485034

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

beforeAll(async () => {
  await LocationProject.create(project)
  await LocationSite.create(site)

  // added 480 minutes of recordings to the table as 2 days, 240 minutes per day
  await RecordingBySiteHour.bulkCreate(Array.from({ length: 48 }, (_, i) => {
    return {
      timePrecisionHourLocal: dayjs('2022-01-01T00:00:00.000+0700', 'YYYY-MM-DD').add(i, 'hour').toDate(),
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
    expect(json).toHaveProperty('2022-01-01', 240)
    expect(json).toHaveProperty('2022-01-02', 240)
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
      timePrecisionHourLocal: dayjs('2022-05-01T00:00:00.000+0700').toDate(),
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
    const json = response.json()
    expect(json).toBeTypeOf('object')
    expect(json).toHaveProperty('2022-05-01', 12.55)
  })

  test.todo('when the recording is removed, the result will be updated')
})
