import { Op } from 'sequelize'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { projectDeleteRoute } from '@rfcx-bio/common/api-bio/project/project-delete'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as coreApi from '~/api-core/api-core'
import { DELETE } from '~/api-helpers/types'
import { env } from '~/env'
import { routesProject } from './index'
import { createProject } from './project-create-bll'

vi.mock('~/api-legacy-arbimon')
vi.mock('~/api-core/api-core')

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'
// Project deletion is now gated on the SUPER_USER_EMAILS allow-list.
const SUPER_EMAIL = 'arbimon-admin@rfcx.org'
const userToken = { idAuth0: 'test', email: SUPER_EMAIL }
const userId = 9001

const { LocationProject, LocationProjectProfile, LocationProjectUserRole } = modelRepositoryWithElevatedPermissions

beforeEach(async () => {
  env.SUPER_USER_EMAILS = SUPER_EMAIL
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
  // (projectRole 'owner' is now irrelevant — gate is super-user only)
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

test(`DELETE ${projectDeleteRoute} is allowed for a non-super owner of a SMALL project`, async () => {
  // 2026-07-12 (operator D3): owners can self-serve delete when the project
  // has <= PROJECT_DELETE_MAX_RECORDINGS recordings (mocked legacy usage = 0).
  const app = await makeApp(routesProject, { userId, userToken: { idAuth0: 'test', email: 'not-super@rfcx.org' }, projectRole: 'owner' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'snail%' } } }).then(p => p?.id ?? 0)
  const url = projectDeleteRoute.replace(':projectId', locationProjectId.toString())

  // Act
  const response = await app.inject({ method: DELETE, url, headers: { Authorization: fakeToken } })

  // Assert
  expect(response.statusCode).toBe(204)
  expect(coreApi.deleteProject).toBeCalledTimes(1)
})

test(`DELETE ${projectDeleteRoute} is forbidden for a non-super owner of a LARGE project`, async () => {
  // Arrange — owner, not super, and the project exceeds the delete threshold
  const legacyApi = await import('~/api-legacy-arbimon')
  vi.mocked(legacyApi.getProjectTieringUsageLegacy).mockResolvedValueOnce({ recordingMinutesCount: 1000000, collaboratorCount: 0, guestCount: 0, patternMatchingCount: 0, jobCount: 0 })
  const app = await makeApp(routesProject, { userId, userToken: { idAuth0: 'test', email: 'not-super@rfcx.org' }, projectRole: 'owner' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'snail%' } } }).then(p => p?.id ?? 0)
  const url = projectDeleteRoute.replace(':projectId', locationProjectId.toString())

  // Act
  const response = await app.inject({ method: DELETE, url, headers: { Authorization: fakeToken } })

  // Assert
  expect(response.statusCode).toBe(403)
  expect(coreApi.deleteProject).not.toBeCalled()
})

test(`DELETE ${projectDeleteRoute} is forbidden for a non-super NON-owner even on a small project`, async () => {
  const app = await makeApp(routesProject, { userId, userToken: { idAuth0: 'test', email: 'not-super@rfcx.org' }, projectRole: 'admin' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'snail%' } } }).then(p => p?.id ?? 0)
  const url = projectDeleteRoute.replace(':projectId', locationProjectId.toString())

  // Act
  const response = await app.inject({ method: DELETE, url, headers: { Authorization: fakeToken } })

  // Assert
  expect(response.statusCode).toBe(403)
  expect(coreApi.deleteProject).not.toBeCalled()
})
