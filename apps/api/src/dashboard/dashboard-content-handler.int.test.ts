import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'

import { GET, PATCH } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-content'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-content`

const FAKE_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5OTI0NDk2MCwiaWF0IjoxNjk5MjQ0OTYwfQ.fWvrkz2W9K-AmQUf5g9EvldvYFxDBQ2K9UmO6oNBvlg'

const EXPECTED_PROPS = [
  'locationProjectId',
  'readme',
  'keyResult',
  'resources',
  'methods'
]

vi.mock('~/api-core/api-core', () => {
  return {
    checkUserPermissionForEditingDashboardContent: vi.fn(async () => {
      return await Promise.resolve(true)
    })
  }
})

const { LocationProjectProfile } = modelRepositoryWithElevatedPermissions

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  await app.register(fastifyRoutes)

  routesDashboard
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (dashboard content)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
      expect(Object.keys(result)).toHaveLength(EXPECTED_PROPS.length)
    })
  })
})

describe(`PATCH ${ROUTE} (dashboard content)`, () => {
  describe('insert when initial rows are empty', async () => {
    beforeEach(async () => {
      await LocationProjectProfile.destroy({ where: { locationProjectId: PROJECT_ID_BASIC } })
    })

    test('insert to summary', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'summary',
          value: 'new summary value'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('new summary value')
      expect(data?.get('readme')).toEqual('')
      expect(data?.get('keyResult')).toEqual('')
      expect(data?.get('resources')).toEqual('')
      expect(data?.get('methods')).toEqual('')
    })

    test('insert to readme', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'readme',
          value: 'new readme value'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('')
      expect(data?.get('readme')).toEqual('new readme value')
      expect(data?.get('keyResult')).toEqual('')
      expect(data?.get('resources')).toEqual('')
      expect(data?.get('methods')).toEqual('')
    })

    test('insert to keyResult', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'keyResult',
          value: 'new keyResult value'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('')
      expect(data?.get('readme')).toEqual('')
      expect(data?.get('keyResult')).toEqual('new keyResult value')
      expect(data?.get('resources')).toEqual('')
      expect(data?.get('methods')).toEqual('')
    })

    test('insert to resources', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'resources',
          value: 'new resources value'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('')
      expect(data?.get('readme')).toEqual('')
      expect(data?.get('keyResult')).toEqual('')
      expect(data?.get('resources')).toEqual('new resources value')
      expect(data?.get('methods')).toEqual('')
    })

    test('insert to methods', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'methods',
          value: 'new methods value'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('')
      expect(data?.get('readme')).toEqual('')
      expect(data?.get('keyResult')).toEqual('')
      expect(data?.get('resources')).toEqual('')
      expect(data?.get('methods')).toEqual('new methods value')
    })
  })

  describe('can edit data without changing other rows', async () => {
    beforeEach(async () => {
      await LocationProjectProfile.upsert({ locationProjectId: Number(PROJECT_ID_BASIC), summary: '0', readme: '0', keyResult: '0', resources: '0', methods: '0', objectives: [], dateStart: null, dateEnd: null })
    })

    test('try editing summary', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'summary',
          value: '1'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('1')
      expect(data?.get('readme')).toEqual('0')
      expect(data?.get('keyResult')).toEqual('0')
      expect(data?.get('resources')).toEqual('0')
      expect(data?.get('methods')).toEqual('0')
    })

    test('try editing readme', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'readme',
          value: '1'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('0')
      expect(data?.get('readme')).toEqual('1')
      expect(data?.get('keyResult')).toEqual('0')
      expect(data?.get('resources')).toEqual('0')
      expect(data?.get('methods')).toEqual('0')
    })

    test('try editing keyResult', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'keyResult',
          value: '1'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('0')
      expect(data?.get('readme')).toEqual('0')
      expect(data?.get('keyResult')).toEqual('1')
      expect(data?.get('resources')).toEqual('0')
      expect(data?.get('methods')).toEqual('0')
    })

    test('try editing resources', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'resources',
          value: '1'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('0')
      expect(data?.get('readme')).toEqual('0')
      expect(data?.get('keyResult')).toEqual('0')
      expect(data?.get('resources')).toEqual('1')
      expect(data?.get('methods')).toEqual('0')
    })

    test('try editing methods', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: PATCH,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload: {
          contentType: 'methods',
          value: '1'
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const json = response.json<{ message: string }>()
      expect(json).toEqual({ message: 'OK' })

      const data = await LocationProjectProfile.findOne({ where: { locationProjectId: PROJECT_ID_BASIC } })
      expect(data).toBeDefined()
      expect(data?.get('summary')).toEqual('0')
      expect(data?.get('readme')).toEqual('0')
      expect(data?.get('keyResult')).toEqual('0')
      expect(data?.get('resources')).toEqual('0')
      expect(data?.get('methods')).toEqual('1')
    })
  })
})
