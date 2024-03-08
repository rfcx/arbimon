import { Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { dashboardStakeholdersRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { createProject } from '@/projects/project-create-bll'
import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const { LocationProject, LocationProjectProfile, LocationProjectUserRole, UserProfile } = modelRepositoryWithElevatedPermissions

vi.mock('~/api-core/api-core')

const currentUserId = 9001
const user1 = {
    email: 'john@test.org',
    firstName: 'John',
    lastName: 'Smith'
}
const user2 = {
    email: 'adam@test.org',
    firstName: 'Adam',
    lastName: 'Murphy'
}

describe(`GET ${dashboardStakeholdersRoute}`, async () => {
    beforeAll(async () => {
        const project = await createProject({ name: 'Grey-blue humpback whales' }, currentUserId, '')
        const locationProjectId = project[1]
        const users = await UserProfile.bulkCreate([user1, user2])
        const userIds = users.map(user => user.id)
        const roles = userIds.map(userId => ({ locationProjectId, userId, roleId: 2, ranking: -1 }))
        await LocationProjectUserRole.bulkCreate(roles)
    })

    afterAll(async () => {
        const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(projects => projects.map(project => project.id))
        await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
        await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
        await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } }, force: true })
        const users = await UserProfile.findAll({ where: { email: { [Op.in]: ['john@test.org', 'adam@test.org'] } } }).then(users => users.map(user => user.id))
        await UserProfile.destroy({ where: { id: { [Op.in]: users } }, force: true })
    })

    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesDashboard, { userId: currentUserId })

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(dashboardStakeholdersRoute)
    })

    test('returns successfully', async () => {
        // Arrange
        const app = await makeApp(routesDashboard, { userId: currentUserId })
        const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

        // Act
        const response = await app.inject({
            method: GET,
            url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.users).toBeDefined()
        expect(result.organizations).toBeDefined()
    })

    test('returns all users for owner', async () => {
        // Arrange
        const app = await makeApp(routesDashboard, { projectRole: 'owner' })
        const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

        // Act
        const response = await app.inject({
            method: GET,
            url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result.users).toBeDefined()
        expect(result.users).toHaveLength(3)
    })

    test('returns all users for admin', async () => {
        // Arrange
        const app = await makeApp(routesDashboard, { projectRole: 'admin' })
        const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

        // Act
        const response = await app.inject({
            method: GET,
            url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result.users).toBeDefined()
        expect(result.users).toHaveLength(3)
    })

    test('returns only listed users for other roles', async () => {
        // Arrange
        const app = await makeApp(routesDashboard, { projectRole: 'user' })
        const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

        // Act
        const response = await app.inject({
            method: GET,
            url: dashboardStakeholdersRoute.replace(':projectId', project?.id.toString() ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result.users).toBeDefined()
        expect(result.users).toHaveLength(1)
    })
})
