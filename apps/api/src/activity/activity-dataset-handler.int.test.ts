import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { activityDatasetGeneratedUrl } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const ROUTE = '/projects/:projectId/activity'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'detectionsBySite',
  'detectionsBySpecies',
  'detectionsByTimeHour',
  'detectionsByTimeDay',
  'detectionsByTimeMonth',
  'detectionsByTimeDate'
]

const getMockedAppLoggedOut = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: false,
      MEMBER_PROJECT_CORE_IDS: []
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesActivity
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const getMockedAppLoggedIn = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: true,
      MEMBER_PROJECT_CORE_IDS: ['zy5jbxx4cs9f', 'bci392pan298', 'rbj7k70v4na7']
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesActivity
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe('simple tests', () => {
  test(`GET ${ROUTE} exists`, async () => {
   // Arrange
   const app = await getMockedAppLoggedOut()

   // Act
   const routes = app.printRoutes()

   // Assert
   expect(routes).toContain(ROUTE)
  })

  test(`GET ${ROUTE} returns successfully`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
    })

    // Assert
    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)
    expect(result).toBeDefined()
    expect(result).toBeTypeOf('object')
  })

  test(`GET ${ROUTE} contains all expected props`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
    })

    // Assert
    const result = JSON.parse(response.body)
    EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
  })

  test(`GET ${ROUTE} does not contain any additional props`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
  })
})

describe('known data tests', async () => {
  // Arrange & Act once
  const app = await getMockedAppLoggedIn()

  const response = await app.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
  })

  test(`GET ${ROUTE} calculates isLocationRedacted correctly`, async () => {
    const result = JSON.parse(response.body)?.isLocationRedacted
    expect(result).toBeDefined()
    expect(result).toEqual(false)
  })

  test(`GET ${ROUTE} calculates detectionsBySite correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsBySite
    expect(result).toBeDefined()
    expect(result).toBeTypeOf('object')
    expect(Object.keys(result).length).toBe(877)
    // ...
  })

  test.todo(`GET ${ROUTE} calculates detectionsBySpecies correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsBySpecies
    expect(result).toBeDefined()
    // ...
  })

  test.todo(`GET ${ROUTE} calculates detectionsByTimeHour correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsByTimeHour
    expect(result).toBeDefined()
    // ...
  })

  test.todo(`GET ${ROUTE} calculate detectionsByTimeDay correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsByTimeDay
    expect(result).toBeDefined()
    // ...
  })

  test.todo(`GET ${ROUTE} calculate detectionsByTimeMonth correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsByTimeMonth
    expect(result).toBeDefined()
    // ...
  })

  test.todo(`GET ${ROUTE} calculate detectionsByTimeDate correctly`, async () => {
    const result = JSON.parse(response.body)?.detectionsByTimeDate
    expect(result).toBeDefined()
    // ...
  })
})

describe('known data tests with redacted data', async () => {
  // Arrange & Act once
  const app = await getMockedAppLoggedOut()

  const response = await app.inject({
    method: GET,
    url: activityDatasetGeneratedUrl({ projectId: '1' }),
    query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
  })

  test(`GET ${ROUTE} calculates isLocationRedacted correctly`, async () => {
    const result = JSON.parse(response.body)?.isLocationRedacted
    expect(result).toBeDefined()
    expect(result).toEqual(true)
  })
})

describe('client errors', () => {
  test(`GET ${ROUTE} rejects missing query`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' })
    })

    // Assert
    expect(response.statusCode).toBe(400)
  })

  test(`GET ${ROUTE} rejects invalid project id`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: 'x' })
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid path params: projectId')
  })

  test(`GET ${ROUTE} rejects invalid date`, async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid query params')
    expect(errorMessage).toContain('startDate with value')
  })
})
