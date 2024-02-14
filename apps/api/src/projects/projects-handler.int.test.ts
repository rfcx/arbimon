import { Op } from 'sequelize'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { projectsDeprecatedRoute, projectsGeoRoute } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import * as projectsDao from './dao/projects-dao'
import { routesProject } from './index'

const userId = 9001

const { LocationProject } = modelRepositoryWithElevatedPermissions

function zeroToN (n: number): number[] {
  return [...Array(n + 1).keys()]
}

afterEach(async () => {
  const locationProjectIds = zeroToN(99).map(i => 1234000 + i)
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
})

describe('Geo route', async () => {
  test(`GET ${projectsGeoRoute} returns`, async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const publicProjects = zeroToN(99).map(i => makeProject(1234000 + i, `Public Project ${i}`, 'published'))
    await LocationProject.bulkCreate(publicProjects, { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: projectsGeoRoute,
      query: { limit: '90' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(90)
    expect(typeof results[49].id).toBe('number')
    expect(typeof results[49].slug).toBe('string')
    expect(typeof results[49].name).toBe('string')
    expect(typeof results[49].latitudeAvg).toBe('number')
    expect(typeof results[49].longitudeAvg).toBe('number')
  })

  test(`GET ${projectsGeoRoute} doesn't return unlisted projects`, async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const unlistedProject = makeProject(1234000, 'Not enough recordings', 'unlisted')
    await LocationProject.bulkCreate([unlistedProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: projectsGeoRoute,
      query: { limit: '1000' }
    })

    // Assert
    const results = JSON.parse(response.body).filter((r: Project) => r.id === unlistedProject.id)
    expect(results).toHaveLength(0)
  })

  test(`GET ${projectsGeoRoute} again with same limit offset will create a cache hit`, async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const publicProject = makeProject(1234000, 'Who called', 'published')
    await LocationProject.bulkCreate([publicProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
    const spy = vi.spyOn(projectsDao, 'query')

    // Act
    const response1 = await app.inject({
      method: GET,
      url: projectsGeoRoute,
      query: {
        limit: '90',
        offset: '0'
      }
    })
    const response2 = await app.inject({
      method: GET,
      url: projectsGeoRoute,
      query: {
        limit: '90',
        offset: '0'
      }
    })

    // Assert
    expect(spy).toHaveBeenCalledOnce()
    const results1 = JSON.parse(response1.body)
    const results2 = JSON.parse(response2.body)
    expect(results1.length).toEqual(results2.length)
  })
})

describe('Deprecated', async () => {
  test(`GET ${projectsDeprecatedRoute} contains published projects`, async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const publicProject = makeProject(1234001, 'Public Project 1', 'published')
    await LocationProject.bulkCreate([publicProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: projectsDeprecatedRoute
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    const expectedProject = results.find((p: any) => p.slug === publicProject.slug)
    expect(expectedProject).toBeDefined()
  })

  test(`GET ${projectsDeprecatedRoute} does not contain hidden projects`, async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const project = makeProject(1234002, 'Private Project 1', 'hidden')
    await LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: projectsDeprecatedRoute
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    const expectedProject = results.find((p: any) => p.slug === project.slug)
    expect(expectedProject).toBeUndefined()
  })
})

describe('Project by slug', async () => {
  test('GET /projects/:slug returns a project', async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const project = makeProject(1234003, 'Project by slug', 'published')
    await LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: `/projects/${project.slug}`
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)
    expect(result.slug).toBe(project.slug)
    expect(result.role).toBe('external')
  })

  test('GET /projects/:slug returns 404 for non-existent project', async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })

    // Act
    const response = await app.inject({
      method: GET,
      url: '/projects/non-existent'
    })

    // Assert
    expect(response.statusCode).toBe(404)
  })

  test('GET /projects/:slug returns 404 for hidden project', async () => {
    // Arrange
    const app = await makeApp(routesProject, { userId })
    const project = makeProject(1234004, 'Hidden Project', 'hidden')
    await LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // Act
    const response = await app.inject({
      method: GET,
      url: `/projects/${project.slug}`
    })

    // Assert
    expect(response.statusCode).toBe(404)
  })
})
