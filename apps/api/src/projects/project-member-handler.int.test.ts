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
const extraUsers = [
  { email: 'collab-1@test.com', firstName: 'Collab', lastName: 'One' },
  { email: 'collab-2@test.com', firstName: 'Collab', lastName: 'Two' },
  { email: 'collab-3@test.com', firstName: 'Collab', lastName: 'Three' },
  { email: 'collab-4@test.com', firstName: 'Collab', lastName: 'Four' },
  { email: 'guest-1@test.com', firstName: 'Guest', lastName: 'One' },
  { email: 'guest-2@test.com', firstName: 'Guest', lastName: 'Two' },
  { email: 'guest-3@test.com', firstName: 'Guest', lastName: 'Three' },
  { email: 'guest-4@test.com', firstName: 'Guest', lastName: 'Four' }
]

const { LocationProject, LocationProjectProfile, LocationProjectUserRole, UserProfile } = modelRepositoryWithElevatedPermissions

beforeAll(async () => {
  await createProject({ name: 'Grey-blue humpback whales' }, currentUserId, '')
  await LocationProject.update({ projectType: 'premium' }, { where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  await UserProfile.create(newUser)
  await UserProfile.bulkCreate(extraUsers)
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
  await UserProfile.destroy({ where: { email: { [Op.in]: [newUser.email, ...extraUsers.map(user => user.email)] } } })
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

// Team-shape limits (2026-08-17): the tests below exercise the FREE tier as
// armed by migration 260817-01 (5 collaborators / 1 Admin / unlimited
// guests). The previous versions of these tests asserted the April-2026
// premium caps (4/3) which were NULLed by the 2026-07-12 rollback — they
// were latently red on master (they only ever passed on develop, which
// predates the rollback). Now the tests pin the seeded-by-migrations state
// so a migration/default drift fails loudly.

test(`POST ${projectMembersRoute} rejects collaborator over free limit`, async () => {
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  await LocationProject.update({ projectType: 'free' }, { where: { id: project?.id } })

  const collaboratorIds = await UserProfile.findAll({
    where: { email: { [Op.in]: extraUsers.slice(0, 5).map(user => user.email) } },
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(row => row.id))

  await LocationProjectUserRole.bulkCreate(collaboratorIds.map(userId => ({
    locationProjectId: project?.id ?? 0,
    userId,
    roleId: getIdByRole('user'),
    ranking: 0
  })))

  const response = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload: { email: newUser.email, role: 'user' },
    headers: { Authorization: fakeToken }
  })

  expect(response.statusCode).toBe(403)
  expect(response.json().message).toContain('up to 5 collaborators')
})

test(`POST ${projectMembersRoute} allows guests over the collaborator cap (guests unlimited on free)`, async () => {
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  await LocationProject.update({ projectType: 'free' }, { where: { id: project?.id } })

  const collaboratorIds = await UserProfile.findAll({
    where: { email: { [Op.in]: extraUsers.slice(0, 5).map(user => user.email) } },
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(row => row.id))

  await LocationProjectUserRole.bulkCreate(collaboratorIds.map(userId => ({
    locationProjectId: project?.id ?? 0,
    userId,
    roleId: getIdByRole('user'),
    ranking: 0
  })))

  const response = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', project?.id.toString() ?? ''),
    payload: { email: newUser.email, role: 'viewer' },
    headers: { Authorization: fakeToken }
  })

  expect(response.statusCode).toBe(204)
  expect(addProjectMemberLegacy).toBeCalledTimes(1)
})

test(`PATCH ${projectMembersRoute} rejects a second Admin on free (admin cap 1, incl. same-bucket promote)`, async () => {
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  const locationProjectId = project?.id ?? 0
  await LocationProject.update({ projectType: 'free' }, { where: { id: locationProjectId } })

  const [firstAdminId] = await UserProfile.findAll({
    where: { email: extraUsers[0].email },
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(row => row.id))
  const targetUserId = await UserProfile.findOne({ where: { email: newUser.email } }).then(user => user?.id ?? 0)

  await LocationProjectUserRole.bulkCreate([
    { locationProjectId, userId: firstAdminId, roleId: getIdByRole('admin'), ranking: 0 },
    // target is already a collaborator — user→admin is same-bucket, which the
    // admin cap must still block
    { locationProjectId, userId: targetUserId, roleId: getIdByRole('user'), ranking: 0 }
  ])

  const response = await app.inject({
    method: PATCH,
    url: projectMembersRoute.replace(':projectId', locationProjectId.toString()),
    payload: { email: newUser.email, role: 'admin' },
    headers: { Authorization: fakeToken }
  })

  expect(response.statusCode).toBe(403)
  expect(response.json().message).toContain('up to 1 Admin member')
})

test(`POST ${projectMembersRoute} pro-owned free project is exempt from team caps`, async () => {
  const app = await makeApp(routesProject, { projectRole: 'admin' })
  const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
  const locationProjectId = project?.id ?? 0
  await LocationProject.update({ projectType: 'free' }, { where: { id: locationProjectId } })

  // make the creator (currentUserId) the Primary Admin and a Pro user
  await LocationProjectUserRole.upsert({ locationProjectId, userId: currentUserId, roleId: getIdByRole('owner'), ranking: 0 })
  await UserProfile.update({ accountTier: 'pro' }, { where: { id: currentUserId } })

  const collaboratorIds = await UserProfile.findAll({
    where: { email: { [Op.in]: extraUsers.slice(0, 5).map(user => user.email) } },
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(row => row.id))
  await LocationProjectUserRole.bulkCreate(collaboratorIds.map(userId => ({
    locationProjectId,
    userId,
    roleId: getIdByRole('user'),
    ranking: 0
  })))

  const response = await app.inject({
    method: POST,
    url: projectMembersRoute.replace(':projectId', locationProjectId.toString()),
    payload: { email: newUser.email, role: 'user' },
    headers: { Authorization: fakeToken }
  })

  // over the 5-collab cap, but the Pro-owner exemption lifts all team limits
  expect(response.statusCode).toBe(204)

  // restore tier for other tests
  await UserProfile.update({ accountTier: 'free' }, { where: { id: currentUserId } })
})
