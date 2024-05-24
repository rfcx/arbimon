import { Op } from 'sequelize'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { projectDeleteRoute } from '@rfcx-bio/common/api-bio/project/project-delete'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as coreApi from '~/api-core/api-core'
import { DELETE } from '~/api-helpers/types'
import { routesProject } from './index'
import { createProject } from './project-create-bll'

vi.mock('~/api-legacy-arbimon')
vi.mock('~/api-core/api-core')

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'
const userToken = { idAuth0: 'test' }
const userId = 9001

const { LocationProject, LocationProjectProfile, LocationProjectUserRole } = modelRepositoryWithElevatedPermissions

beforeEach(async () => {
  await createProject({ name: 'Snail with an itchy foot' }, userId, fakeToken)
})

afterEach(async () => {
  const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'snail%' } } }).then(projects => projects.map(project => project.id))
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } }, force: true })
})

test(`DELETE ${projectDeleteRoute} deletes local project`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { userId, userToken, projectRole: 'owner' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'snail%' } } }).then(p => p?.id ?? 0)
  const url = projectDeleteRoute.replace(':projectId', locationProjectId.toString())

  // Act
  const response = await app.inject({ method: DELETE, url, headers: { Authorization: fakeToken } })

  // Assert
  expect(response.statusCode).toBe(204)
  expect(coreApi.deleteProject).toBeCalledTimes(1)
  const project = await LocationProject.findByPk(locationProjectId, { paranoid: false })
  expect(project).not.toBeNull()
  expect(project?.deletedAt).toBeTruthy()
})
