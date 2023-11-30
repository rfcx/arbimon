import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { describe, expect, test, vi } from 'vitest'

import { type CreateOrganizationResponseBody } from '@rfcx-bio/common/api-bio/organizations/create-organization'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { POST } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesOrganizations } from './index'

const ROUTE = '/organizations'
const url = '/organizations'

vi.mock('./create-organization-bll', async () => {
  const mod = await vi.importActual('./create-organization-bll')

  return {
    // @ts-expect-error type mismatch but just ignore it.
    ...mod,
    getOrganizationLogoLink: vi.fn(async () => {
      return await Promise.resolve('https://www.bu.ac.th/favicon.ico')
    })
  }
})

const payload = {
  name: 'Bangkok University',
  url: 'https://www.bu.ac.th/th/',
  type: 'research-institution'
}

const FAKE_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5OTI0NDk2MCwiaWF0IjoxNjk5MjQ0OTYwfQ.fWvrkz2W9K-AmQUf5g9EvldvYFxDBQ2K9UmO6oNBvlg'

const EXPECTED_PROPS = [
  'id',
  'name',
  'type',
  'url',
  'image'
]

const sequelize = getSequelize()

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  await app.register(fastifyRoutes)

  routesOrganizations
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`POST ${ROUTE} (create organization)`, () => {
  describe('simple tests', async () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('insert successfully', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: POST,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload
      })

      const json = response.json<CreateOrganizationResponseBody>()

      console.info(response)

      expect(response.statusCode).toBe(200)
      EXPECTED_PROPS.forEach(expectedProp => { expect(json).toHaveProperty(expectedProp) })

      const data = await ModelRepository.getInstance(sequelize).Organization.findOne({ where: { id: json.id } })
      expect(data).toBeTruthy()
    })
  })
})
