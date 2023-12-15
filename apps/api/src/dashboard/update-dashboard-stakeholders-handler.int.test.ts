import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectUserRole, type UserProfile } from '@rfcx-bio/common/dao/types'

import { GET, PATCH } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-stakeholders'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-stakeholders`

const FAKE_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5OTI0NDk2MCwiaWF0IjoxNjk5MjQ0OTYwfQ.fWvrkz2W9K-AmQUf5g9EvldvYFxDBQ2K9UmO6oNBvlg'

const EXPECTED_PROPS = [
  'users',
  'organizations'
]

const users: UserProfile[] = [
  {
    id: 1001,
    firstName: 'Logan',
    lastName: 'Sargeant',
    email: 'logansick248@gmail.com',
    idAuth0: 'auth0|xys',
    organizationIdAffiliated: undefined
  },
  {
    id: 1002,
    firstName: 'John',
    lastName: 'Mayor',
    email: 'mayorjohns848@gmail.com',
    idAuth0: 'auth0|sqft2',
    organizationIdAffiliated: undefined
  },
  {
    id: 1003,
    firstName: 'Charles',
    lastName: 'Leclere',
    email: 'lecleresf90@rfcx.org',
    idAuth0: 'auth0|mayorsi93',
    organizationIdAffiliated: undefined
  }
]

const userRoles: LocationProjectUserRole[] = [
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1001,
    roleId: 3,
    ranking: -1
  },
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1002,
    roleId: 3,
    ranking: -1
  },
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1003,
    roleId: 4,
    ranking: -1
  }
]

const sequelize = getSequelize()

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  await app.register(fastifyRoutes)

  routesDashboard
    .map(({ preHandler, preValidation, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (dashboard stakeholders)`, () => {
  describe('simple test', () => {
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

describe(`PATCH ${ROUTE} (dashboard stakeholders)`, () => {
  afterEach(async () => {
    await ModelRepository.getInstance(sequelize).UserProfile.destroy({ where: { id: users.map(u => u.id) } })
    await ModelRepository.getInstance(sequelize).LocationProjectUserRole.destroy({ where: { locationProjectId: PROJECT_ID_BASIC } })
  })

  beforeEach(async () => {
    await ModelRepository.getInstance(sequelize).UserProfile.bulkCreate(users)
    await ModelRepository.getInstance(sequelize).LocationProjectUserRole.bulkCreate(userRoles)
  })

  test('partial update to user role', async () => {
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
        organizations: [],
        users: [{ userId: 1001, ranking: 0 }]
      }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const data = await ModelRepository.getInstance(sequelize).LocationProjectUserRole.findOne({ where: { locationProjectId: PROJECT_ID_BASIC, userId: 1001 }, plain: true })
    expect(data?.ranking).toBe(0)
  })
})
