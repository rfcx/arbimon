import { Op } from 'sequelize'
import { afterEach, expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const userId = 9001

function makeProject (id: number, name: string): Project {
  return {
    id,
    idCore: id.toString(),
    idArbimon: id,
    slug: name.toLowerCase().replace(' ', '-'),
    name,
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
}

const { LocationProject, ProjectVersion } = modelRepositoryWithElevatedPermissions

afterEach(async () => {
  const locationProjectIds = [1234001, 1234002]
  await ProjectVersion.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } } })
})

test('GET /projects contains public projects', async () => {
  // Arrange
  const app = await makeApp(routesProject, { userId })
  const publicProject = makeProject(1234001, 'Public Project 1')
  await LocationProject.bulkCreate([publicProject], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
  await ProjectVersion.create({ locationProjectId: publicProject.id, isPublished: true, isPublic: true })

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
  const project = makeProject(1234002, 'Private Project 1')
  await LocationProject.bulkCreate([project], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
  await ProjectVersion.create({ locationProjectId: project.id, isPublished: false, isPublic: false })

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
