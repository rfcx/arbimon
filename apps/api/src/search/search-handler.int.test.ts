import dayjs from 'dayjs'
import { type Sequelize, Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { searchRoute, xSearchTotalCountHeaderName } from '@rfcx-bio/common/api-bio/search/search'
import { literalizeCountsByMinute } from '@rfcx-bio/common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type DetectionBySiteSpeciesHour, type RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import { env } from '~/env'
import { getOpenSearchClient } from '~/opensearch'
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

function makeDetectionBySiteSpeciesHour (locationProjectId: number, locationSiteId: number, taxonClassId: number, taxonSpeciesId: number, startDate: string, hourOffset: number): DetectionBySiteSpeciesHour {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    taxonClassId,
    taxonSpeciesId,
    count: 1,
    countsByMinute: [[5, 1]]
  }
}

const { LocationProject, LocationSite, RecordingBySiteHour: RecordingBySiteHourModel, DetectionBySiteSpeciesHour: DetectionBySiteSpeciesHourModel, TaxonSpecies } = modelRepositoryWithElevatedPermissions
const sequelize = RecordingBySiteHourModel.sequelize as Sequelize
const opensearch = getOpenSearchClient()

describe('Local search', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'false'

    const p1 = makeProject(2345001, 'Listed khaokho 1', 'listed')
    const p2 = makeProject(2345002, 'Listed sukhothai 2', 'published')
    const p3 = makeProject(2345003, 'Listed sukhothai 3', 'published')
    const p4 = makeProject(2345004, 'Unlisted khaokho 1', 'hidden') // user requested hidden
    const p5 = makeProject(2345005, 'Unlisted khaokho 2', 'unlisted') // does not meet the criteria for listing
    await LocationProject.bulkCreate([p1, p2, p3, p4, p5], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // p1 needs meet the listing critera (recordingsCount > 1000)
    const p1s1 = { id: 23450011, idCore: '23450011', idArbimon: 23450011, name: 'P1 Site 1', locationProjectId: p1.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
    await LocationSite.bulkCreate([p1s1])
    const p1s1recordings = zeroToN(20).map(i => literalizeCountsByMinute(makeRecordingBySiteHour(p1.id, p1s1.id, '2023-05-02', i), sequelize))
    await RecordingBySiteHourModel.bulkCreate(p1s1recordings)

    // p3 needs more species than p2
    const taxonSpecies = await TaxonSpecies.findOne()
    const p3s1 = { id: 23450031, idCore: '23450031', idArbimon: 23450031, name: 'P3 Site 1', locationProjectId: p3.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
    await LocationSite.bulkCreate([p3s1])
    const p3s1detections = [literalizeCountsByMinute(makeDetectionBySiteSpeciesHour(p3.id, p3s1.id, taxonSpecies?.taxonClassId ?? 0, taxonSpecies?.id ?? 0, '2023-05-02', 0), sequelize)]
    await DetectionBySiteSpeciesHourModel.bulkCreate(p3s1detections)

    await sequelize.query('REFRESH MATERIALIZED VIEW location_project_recording_metric')
    await sequelize.query('REFRESH MATERIALIZED VIEW location_project_detection_metric')
  })

  afterAll(async () => {
    const locationProjectIds = [2345001, 2345002, 2345003]
    await RecordingBySiteHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationSite.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    env.OPENSEARCH_ENABLED = 'false'
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

  test(`GET ${searchRoute}?type=project&q= will return projects which orders by recording minutes count`, async () => {
    env.OPENSEARCH_ENABLED = 'false'
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: '' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    expect(response.headers?.[xSearchTotalCountHeaderName]).toBeDefined()
  })
})

describe('OpenSearch search', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'true'
    const p1 = makeProject(7689921, 'Alton diversity', 'published')
    await opensearch.index({
      id: '7689921',
      index: 'projects',
      body: {
        id_core: p1.idCore,
        id_arbimon: p1.idArbimon,
        name: p1.name,
        slug: p1.slug,
        status: p1.status,
        latitude_north: p1.latitudeNorth,
        latitude_south: p1.latitudeSouth,
        longitude_east: p1.longitudeEast,
        longitude_west: p1.longitudeWest,
        summary: '',
        date_start: null,
        date_end: null,
        objectives: [],
        image: '',
        country_codes: [],
        species_count: 18,
        recording_minutes_count: 1890,
        detection_minutes_count: 1992,
        min_date: '2023-01-01T00:00:00.000Z',
        max_date: '2023-11-25T18:24:59.223Z',
        recording_min_date: '2023-02-01T00:00:00.000Z',
        recording_max_date: '2023-11-20T18:24:59.223Z',
        detection_min_date: '2023-01-01T00:00:00.000Z',
        detection_max_date: '2023-11-25T18:24:59.223Z'
      },
      refresh: true
    })
  })

  afterAll(async () => {
    env.OPENSEARCH_ENABLED = 'false'
    await opensearch.delete({ index: 'projects', id: '7689921' })
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: 'Alton' }
    })

    // Assert
    expect(response.headers?.[xSearchTotalCountHeaderName]).toBe(1)
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    const project = results.find((p: { id: number }) => p.id === 7689921)
    expect(project).toBeDefined()
    expect(project.name).toBeDefined()
    expect(project.recordingMinutesCount).toBe(1890)
  })
})
