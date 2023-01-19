import fastifyRoutes from '@fastify/routes'
import fastify, { FastifyInstance } from 'fastify'
import { expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { GET } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesProject } from './index'

function makeProject (id: number, name: string): Project {
  return {
    id: id,
    idCore: id.toString(),
    idArbimon: id,
    slug: name.toLowerCase().replace(' ', '-'),
    name: name,
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
}

const models = ModelRepository.getInstance(getSequelize())

const getMockedApp = async (projectIds: string[] | undefined = undefined): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRoutes)

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: projectIds !== undefined,
      MEMBER_PROJECT_CORE_IDS: projectIds
    })[key],
    set: () => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

test('GET /projects contains valid project', async () => {
  // Arrange
  const app = await getMockedApp(['integration5'])

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const result = JSON.parse(response.body)
  const expectedProject = result.find((p: any) => p.slug === 'integration-test-project-50001001')
  expect(expectedProject).toBeDefined()
  expect(expectedProject.name).toBe('Integration Test Project 5')
})

test('GET /projects contains public projects', async () => {
  // Arrange
  const app = await getMockedApp()
  const publicProject = makeProject(1234001, 'Public Project 1')
  await models.LocationProject.bulkCreate([publicProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
  await models.ProjectVersion.create({ locationProjectId: publicProject.id, isPublished: true, isPublic: true })

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const results = JSON.parse(response.body)
  const expectedProject = results.find((p: any) => p.slug === publicProject.slug)
  expect(expectedProject).toBeDefined()
})

test('GET /projects does not contain non-public projects', async () => {
  // Arrange
  const app = await getMockedApp()
  const project = makeProject(1234002, 'Private Project 1')
  await models.LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
  await models.ProjectVersion.create({ locationProjectId: project.id, isPublished: false, isPublic: false })

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const results = JSON.parse(response.body)
  const expectedProject = results.find((p: any) => p.slug === project.slug)
  expect(expectedProject).not.toBeDefined()
})
