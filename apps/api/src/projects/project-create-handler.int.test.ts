import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { Op } from 'sequelize'
import { afterEach, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import * as coreApi from '~/api-core/api-core'
import { POST } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesProject } from './index'

vi.mock('~/api-core/api-core')

const ROUTE = '/projects'

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRoutes)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const biodiversitySequelize = getSequelize()
const { LocationProject } = ModelRepository.getInstance(biodiversitySequelize)

afterEach(async () => {
  await LocationProject.destroy({ where: { slug: { [Op.like]: 'red-squirrels%' } } })
})

test('POST /projects creates local project', async () => {
  // Arrange
  const app = await getMockedApp()
  const project = { name: 'Red Squirrels are back' }

  // Act
  const response = await app.inject({
    method: POST,
    url: ROUTE,
    payload: project
  })

  // Assert
  expect(coreApi.createProject).toBeCalledTimes(1)
  expect(response.statusCode).toBe(201)
  const result = JSON.parse(response.body)
  expect(result.slug).toBe('red-squirrels-are-back')
})
