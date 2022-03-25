import fastify, { FastifyInstance } from 'fastify'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import { expect, test } from 'vitest'

import { richnessDatasetRoute, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { GET } from '~/api-helpers/types'
import { routesRichness } from './index'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'richnessByTaxon',
  'richnessBySite',
  'richnessByTimeHourOfDay',
  'richnessByTimeDayOfWeek',
  'richnessByTimeMonthOfYear',
  'richnessByTimeUnix',
  'richnessPresence',
  'richnessExport'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRequestContextPlugin)

  routesRichness
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const mockedApp = await getMockedApp()

test(`GET ${richnessDatasetRoute} missing query`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: '/projects/1/richness'
  })

  // Assert
  expect(response.statusCode).toBe(400)
})

test(`GET ${richnessDatasetRoute} invalid project id`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: '/projects/x/richness'
  })

  // Assert
  expect(response.statusCode).toBe(400)

  const result = JSON.parse(response.body)
  const errorMessage = result.message
  expect(errorMessage).toContain('Invalid path params: projectId')
})

test(`GET ${richnessDatasetRoute} date is not valid`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: '/projects/1/richness',
    query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
  })

  // Assert
  expect(response.statusCode).toBe(400)

  const result = JSON.parse(response.body)
  const errorMessage = result.message
  expect(errorMessage).toContain('Invalid query params: startDateUtcInclusive')
})

test(`GET ${richnessDatasetRoute} to return successfully`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: '/projects/1/richness',
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const result = JSON.parse(response.body)
  expect(result).toBeDefined()
  expect(result).toBeTypeOf('object')
})

test(`GET ${richnessDatasetRoute} contains all expected props`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: richnessDatasetUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
  })

  // Assert
  const result = JSON.parse(response.body)
  EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
})

test(`GET ${richnessDatasetRoute} does not contain any additional props`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: richnessDatasetUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
  })

  // Assert
  const result = JSON.parse(response.body)
  Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
})

test(`GET ${richnessDatasetRoute} does not have any data on given date`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: richnessDatasetUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
  })

  // Assert
  const result = JSON.parse(response.body)
  Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))

  expect(result.richnessBySite).toEqual([])
  expect(result.richnessByTaxon).toEqual({})
  expect(result.richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 })
  expect(result.richnessByTimeUnix).toEqual({})
  expect(result.richnessExport).toEqual([])
  expect(result.richnessPresence).toEqual([])
})
