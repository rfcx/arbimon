import { Op } from 'sequelize'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { dashboardStakeholdersRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { createProject } from '@/projects/project-create-bll'
import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const { LocationProject, LocationProjectProfile, LocationProjectUserRole, UserProfile } = modelRepositoryWithElevatedPermissions

const currentUserId = 9001
const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'

const user1 = {
    email: 'user1@test.org',
    firstName: 'User1',
    lastName: 'User1-LastName'
}

const user2 = {
    email: 'user2@test.org',
    firstName: 'User2',
    lastName: 'User2-LastName'
}
beforeAll(async () => {
    const project = await createProject({ name: 'Grey-blue humpback whales' }, currentUserId, '')
    const locationProjectId = project[1]
    const users = await UserProfile.bulkCreate([user1, user2])
    const userIds = users.map(user => user.id)
    const roles = userIds.map(userId => ({ locationProjectId, userId, roleId: 1, ranking: -1 }))
    await LocationProjectUserRole.bulkCreate(roles)
})

afterAll(async () => {
    const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(projects => projects.map(project => project.id))
    await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
    await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
    await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } }, force: true })
    const users = await UserProfile.findAll({ where: { email: { [Op.in]: ['user1@test.org', 'user2@test.org'] } } }).then(users => users.map(user => user.id))
    await UserProfile.destroy({ where: { id: { [Op.in]: users } }, force: true })
})

test(`GET ${dashboardStakeholdersRoute} exists`, async () => {
    // Arrange
    const app = await makeApp(routesDashboard, { userId: currentUserId })

    // Act
    const routes = [...app.routes.keys()]

    // Assert
    expect(routes).toContain(dashboardStakeholdersRoute)
}, 10000)

test(`GET ${dashboardStakeholdersRoute} returns successfully`, async () => {
    // Arrange
    const app = await makeApp(routesDashboard, { userId: currentUserId })
    const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

    // Act
    const response = await app.inject({
        method: GET,
        url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? ''),
        headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)
    expect(result).toBeDefined()
    expect(result).toBeTypeOf('object')
    expect(result.users).toBeDefined()
    expect(result.organizations).toBeDefined()
})

test(`GET ${dashboardStakeholdersRoute} returns all users for owner`, async () => {
    // Arrange
    const app = await makeApp(routesDashboard, { userId: currentUserId })
    const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })
    // Act
    const response = await app.inject({
        method: GET,
        url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? ''),
        headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)
    expect(result).toBeDefined()
    expect(result.users).toBeDefined()
    expect(result.users).toHaveLength(3)
})
