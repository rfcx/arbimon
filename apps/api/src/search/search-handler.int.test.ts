import dayjs from 'dayjs'
import { type Sequelize, Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { searchRoute } from '@rfcx-bio/common/api-bio/search/search'
import { literalizeCountsByMinute } from '@rfcx-bio/common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import { env } from '~/env'
import { routesSearch } from './index'

function zeroToN (n: number): number[] {
  return [...Array(n + 1).keys()]
}

function makeRecordingBySiteHour (locationProjectId: number, locationSiteId: number, startDate: string, hourOffset: number): RecordingBySiteHour {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    count: 60,
    countsByMinute: zeroToN(59).map(i => [i, 1]),
    totalDurationInMinutes: 60
  }
}

const { LocationProject, LocationSite, RecordingBySiteHour: RecordingBySiteHourModel } = modelRepositoryWithElevatedPermissions
const sequelize = RecordingBySiteHourModel.sequelize as Sequelize

describe('Local search', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'false'

    const p1 = makeProject(2345001, 'Listed khaokho 1', 'listed')
    const p2 = makeProject(2345002, 'Unlisted khaokho 1', 'hidden') // user requested hidden
    const p3 = makeProject(2345003, 'Unlisted khaokho 2', 'unlisted') // does not meet the criteria for listing
    await LocationProject.bulkCreate([p1, p2, p3], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // p1 needs meet the listing critera (recordingsCount > 1000)
    const p1s1 = { id: 23450011, idCore: '23450011', idArbimon: 23450011, name: 'Site 1', locationProjectId: p1.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
    await LocationSite.bulkCreate([p1s1])
    const p1s1recordings = zeroToN(20).map(i => literalizeCountsByMinute(makeRecordingBySiteHour(p1.id, p1s1.id, '2023-05-02', i), sequelize))
    await RecordingBySiteHourModel.bulkCreate(p1s1recordings)
    await sequelize.query('REFRESH MATERIALIZED VIEW location_project_recording_metric')
  })

  afterAll(async () => {
    const locationProjectIds = [2345001, 2345002, 2345003]
    await RecordingBySiteHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationSite.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: 'khaokho' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    const project = results.find((p: { id: number }) => p.id === 2345001)
    expect(project).toBeDefined()
    expect(project.name).toBeDefined()
    expect(project.recordingMinutesCount).toBe(1260)
  })
})

describe('OpenSearch search', async () => {
  beforeAll(() => {
    env.OPENSEARCH_ENABLED = 'true'
    // TODO populate opensearch
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: 'khaokho' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    // TODO: check response body
  })
})