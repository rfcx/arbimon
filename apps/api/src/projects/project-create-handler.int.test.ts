import { Op } from 'sequelize'
import { afterEach, expect, test, vi } from 'vitest'

import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as coreApi from '~/api-core/api-core'
import { POST } from '~/api-helpers/types'
import { routesProject } from './index'

vi.mock('~/api-core/api-core')

const ROUTE = '/projects'

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'
const userToken = { idAuth0: 'test' }
const userId = 9001

const { LocationProject, LocationProjectProfile, LocationProjectUserRole, ProjectVersion } = modelRepositoryWithElevatedPermissions

afterEach(async () => {
  const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.or]: [{ [Op.like]: 'red-squirrels%' }, { [Op.like]: 'greys-linger%' }] } } }).then(projects => projects.map(project => project.id))
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await ProjectVersion.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } } })
})

test('POST /projects creates local project', async () => {
  // Arrange
  const app = await makeApp(routesProject, { userId, userToken })
  const project: ProjectCreateRequest = { name: 'Red Squirrels are back', isPublic: true }

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

test('POST /projects adds extra infomation (profile, owner role, version)', async () => {
  // Arrange
  const app = await makeApp(routesProject, { userId, userToken })

  // Act
  const response = await app.inject({
    method: POST,
    url: ROUTE,
    payload: { name: 'Greys linger', isPublic: true },
    headers: { Authorization: fakeToken }
  })

  // Assert
  const result = JSON.parse(response.body)
  const project = await LocationProject.findOne({ where: { slug: result.slug } })
  expect(project).toBeDefined()
  const projectRoles = await LocationProjectUserRole.findAll({ where: { locationProjectId: project?.id } })
  expect(projectRoles).toHaveLength(1)
  expect(projectRoles[0].userId).toBe(userId)
  // Assert project version
  const projectVersion = await ProjectVersion.findOne({ where: { locationProjectId: project?.id } })
  expect(projectVersion).toBeDefined()
  expect(projectVersion?.isPublic).toBe(true)
})
