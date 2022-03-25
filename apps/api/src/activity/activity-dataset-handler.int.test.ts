import { FastifyInstance } from 'fastify'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import { expect, test } from 'vitest'

import { activityDatasetGeneratedUrl, activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { testApp } from '@/_testing/app-routes'
import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'detectionsBySite',
  'detectionsBySpecies',
  'detectionsByTimeHour',
  'detectionsByTimeDay',
  'detectionsByTimeMonth',
  'detectionsByTimeDate'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  // Replace preHandlers that call external APIs
  // TODO: Think about mocking!
  routesActivity.forEach(r => { r.preHandler = [] })
  const app = await testApp(routesActivity)
  await app.register(fastifyRequestContextPlugin)
  return app
}

const mockedApp = await getMockedApp()

test(`GET ${activityDatasetRoute} missing query`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' })
  })

  // Assert
  expect(response.statusCode).toBe(400)
})

test(`GET ${activityDatasetRoute} invalid project id`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: 'x' })
  })

  // Assert
  expect(response.statusCode).toBe(400)

  const result = JSON.parse(response.body)
  const errorMessage = result.message
  expect(errorMessage).toContain('Invalid path params: projectId')
})

test(`GET ${activityDatasetRoute} date is not valid`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
  })

  // Assert
  expect(response.statusCode).toBe(400)

  const result = JSON.parse(response.body)
  const errorMessage = result.message
  expect(errorMessage).toContain('Invalid query params: startDateUtcInclusive')
})

test(`GET ${activityDatasetRoute} to return successfully`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const result = JSON.parse(response.body)
  expect(result).toBeDefined()
  expect(result).toBeTypeOf('object')
})

test(`GET ${activityDatasetRoute} contains all expected props`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
  })

  // Assert
  const result = JSON.parse(response.body)
  EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
})

test(`GET ${activityDatasetRoute} does not contain any additional props`, async () => {
  // Act
  const response = await mockedApp.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
  })

  // Assert
  const result = JSON.parse(response.body)
  Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
})
