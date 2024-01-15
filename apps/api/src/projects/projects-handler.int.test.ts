import { Op } from 'sequelize'
import { afterEach, expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const userId = 9001

const { LocationProject } = modelRepositoryWithElevatedPermissions

afterEach(async () => {
  const locationProjectIds = [1234001, 1234002]
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } } })
})

test('GET /projects contains public projects', async () => {
  // Arrange
  const app = await makeApp(routesProject, { userId })
  const publicProject = makeProject(1234001, 'Public Project 1', 'published')
  await LocationProject.bulkCreate([publicProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

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
  const app = await makeApp(routesProject, { userId })
  const project = makeProject(1234002, 'Private Project 1', 'hidden')
  await LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

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
