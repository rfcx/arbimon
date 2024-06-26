import { Op } from 'sequelize'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import { type ProjectMemberAddRemoveRequest, projectMembersRoute } from '@rfcx-bio/common/api-bio/project/project-members'
import { getIdByRole } from '@rfcx-bio/common/roles'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { DELETE, PATCH, POST } from '~/api-helpers/types'
import { addProjectMemberLegacy, removeProjectMemberLegacy, updateProjectMemberLegacy } from '~/api-legacy-arbimon'
import { routesProject } from './index'
import { createProject } from './project-create-bll'

vi.mock('~/api-core/api-core')
vi.mock('~/api-legacy-arbimon')

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'

const currentUserId = 9001
const newUser = { email: 'ronnie@test.com', firstName: 'Ronnie', lastName: 'OS' }

const { LocationProject, LocationProjectProfile, LocationProjectUserRole, UserProfile } = modelRepositoryWithElevatedPermissions

beforeAll(async () => {
  await createProject({ name: 'Grey-blue humpback whales' }, currentUserId, '')
  await UserProfile.create(newUser)
})

afterEach(async () => {
  vi.resetAllMocks()
  const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(projects => projects.map(project => project.id))
  await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects }, userId: { [Op.ne]: currentUserId } } })
})

afterAll(async () => {
  const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(projects => projects.map(project => project.id))
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } }, force: true })
  await UserProfile.destroy({ where: { email: newUser.email } })
})

test(`POST ${projectMembersRoute} adds user assigns default role`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  const payload: ProjectMemberAddRemoveRequest = { email: newUser.email }

  // Act
  const response = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload,
    headers: { Authorization: fakeToken }
  })

  // Assert
  expect(response.statusCode).toBe(204)
  const projectUserRole = await LocationProjectUserRole.findOne({ where: { locationProjectId: project?.id, userId: { [Op.ne]: currentUserId } } })
  expect(projectUserRole).not.toBeNull()
  expect(projectUserRole?.roleId).toBe(getIdByRole('user'))
  expect(addProjectMemberLegacy).toBeCalledTimes(1)
})

test(`POST ${projectMembersRoute} adds user with role`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  const payload: ProjectMemberAddRemoveRequest = { email: newUser.email, role: 'admin' }

  // Act
  const response = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload,
    headers: { Authorization: fakeToken }
  })

  // Assert
  expect(response.statusCode).toBe(204)
  const projectUserRole = await LocationProjectUserRole.findOne({ where: { locationProjectId: project?.id, userId: { [Op.ne]: currentUserId } } })
  expect(projectUserRole).not.toBeNull()
  expect(projectUserRole?.roleId).toBe(getIdByRole('admin'))
  expect(addProjectMemberLegacy).toBeCalledTimes(1)
})

test(`POST ${projectMembersRoute} multiple times results in 204 calls not 500`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  const payload: ProjectMemberAddRemoveRequest = { email: newUser.email, role: 'admin' }
  const responseFirst = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload,
    headers: { authorization: fakeToken }
  })

  // Act
  const responseSecond = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload,
    headers: { authorization: fakeToken }
  })

  // Assert
  expect(responseFirst.statusCode).toEqual(204)
  expect(responseSecond.statusCode).toEqual(204)
})

test(`DELETE ${projectMembersRoute} removes user`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(p => p?.id ?? 0)
  const userId = await UserProfile.findOne({ where: { email: newUser.email } }).then(u => u?.id ?? 0)
  await LocationProjectUserRole.create({ locationProjectId, userId, roleId: getIdByRole('user'), ranking: 0 })
  const payload: ProjectMemberAddRemoveRequest = { email: newUser.email }

  // Act
  const response = await app.inject({
    method: DELETE,
    url: projectMembersRoute.replace(':projectId', locationProjectId.toString() ?? ''),
    payload,
    headers: { Authorization: fakeToken }
  })

  // Assert
  expect(response.statusCode).toBe(204)
  const projectUserRole = await LocationProjectUserRole.findOne({ where: { locationProjectId, userId } })
  expect(projectUserRole).toBeNull()
  expect(removeProjectMemberLegacy).toBeCalledTimes(1)
})

test(`PATCH ${projectMembersRoute} removes user`, async () => {
  // Arrange
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const locationProjectId = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(p => p?.id ?? 0)
  const userId = await UserProfile.findOne({ where: { email: newUser.email } }).then(u => u?.id ?? 0)
  await LocationProjectUserRole.create({ locationProjectId, userId, roleId: getIdByRole('user'), ranking: 0 })
  const payload: ProjectMemberAddRemoveRequest = { email: newUser.email, role: 'expert' }

  // Act
  const response = await app.inject({
    method: PATCH,
    url: projectMembersRoute.replace(':projectId', locationProjectId.toString() ?? ''),
    payload,
    headers: { Authorization: fakeToken }
  })

  // Assert
  expect(response.statusCode).toBe(204)
  const projectUserRole = await LocationProjectUserRole.findOne({ where: { locationProjectId, userId } })
  expect(projectUserRole).not.toBeNull()
  expect(projectUserRole?.roleId).toBe(getIdByRole('expert'))
  expect(updateProjectMemberLegacy).toBeCalledTimes(1)
})
