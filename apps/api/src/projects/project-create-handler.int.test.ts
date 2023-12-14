import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import { Op } from 'sequelize'
import { afterEach, expect, test, vi } from 'vitest'

import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import * as coreApi from '~/api-core/api-core'
import { POST } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesProject } from './index'

vi.mock('~/api-core/api-core')

const ROUTE = '/projects'

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyAuth0Verify, { domain: 'unknown.com' })
  await app.register(fastifyRoutes)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const biodiversitySequelize = getSequelize()
const { LocationProject, LocationProjectProfile } = ModelRepository.getInstance(biodiversitySequelize)

afterEach(async () => {
  const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'red-squirrels%' } } }).then(projects => projects.map(project => project.id))
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } } })
})

test('POST /projects creates local project', async () => {
  // Arrange
  const app = await getMockedApp()
  const project: ProjectCreateRequest = { name: 'Red Squirrels are back' }

  // Act
  const response = await app.inject({
    method: POST,
    url: ROUTE,
    payload: project,
    headers: { Authorization: fakeToken }
  })

  // Assert
  expect(coreApi.createProject).toBeCalledTimes(1)
  expect(response.statusCode).toBe(201)
  const result = JSON.parse(response.body)
  expect(result.slug).toBe('red-squirrels-are-back')
})
