import { Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'
import { getIdByRole } from '@rfcx-bio/common/roles'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { routesBackup } from '@/backup/index'
import { GET, POST } from '~/api-helpers/types'

const { LocationProject, LocationProjectUserRole, Backup } = modelRepositoryWithElevatedPermissions

const ROUTE = backupsRoute
const ownerId = 9001
const userId = 9002
const adminId = 9003
const projectId1 = 2791456
const projectId2 = 2791457

const BACKUP_GET_PROPS = ['requestedAt', 'url', 'status', 'expiresAt']

beforeAll(async () => {
    const project1 = makeProject(projectId1, 'Arctic foxes in Iceland')
    const project2 = makeProject(projectId2, 'Belugas in Norway')
    await LocationProject.bulkCreate([project1, project2])
    await LocationProjectUserRole.create({ locationProjectId: projectId1, userId: ownerId, roleId: getIdByRole('owner'), ranking: 0 })
    await LocationProjectUserRole.create({ locationProjectId: projectId1, userId, roleId: getIdByRole('user'), ranking: 0 })
    await LocationProjectUserRole.create({ locationProjectId: projectId1, userId: adminId, roleId: getIdByRole('admin'), ranking: 0 })
    await LocationProjectUserRole.create({ locationProjectId: projectId2, userId: ownerId, roleId: getIdByRole('owner'), ranking: 0 })
})

afterAll(async () => {
    await LocationProjectUserRole.destroy({ where: { locationProjectId: projectId1, userId: ownerId }, force: true })
    await LocationProjectUserRole.destroy({ where: { locationProjectId: projectId1, userId }, force: true })
    await LocationProjectUserRole.destroy({ where: { locationProjectId: projectId2, userId: ownerId }, force: true })
    await Backup.destroy({ where: { entity: 'project', entityId: { [Op.in]: [projectId1, projectId2] } }, force: true })
    await LocationProject.destroy({ where: { id: projectId1 }, force: true })
    await LocationProject.destroy({ where: { id: projectId2 }, force: true })
})

describe(`POST ${backupsRoute}`, async () => {
    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesBackup)

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(backupsRoute)
    })

    test('creates a project backup request successfully', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })
        const backup = {
            entity: 'project',
            entityId: projectId1
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(201)
    })

    test('created and returned backup request contains the correct information', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })
        const backup = {
            entity: 'project',
            entityId: projectId2
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(201)
        const result = JSON.parse(response.body)
        expect(result.backup).toBeDefined()
        expect(result.backup.entity).toBe('project')
        expect(result.backup.entityId).toBe(projectId2)
        expect(result.backup.requestedBy).toBe(ownerId)
    })

    test('backup cannot be requested within 7 days after the last request', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })
        const backup = {
            entity: 'project',
            entityId: projectId1
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(500)
    })

    test('Can only have 1 on-going backup per project regardless of who has requested the backup', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: adminId })
        const backup = {
            entity: 'project',
            entityId: projectId1
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(500)
    })

    test('returns 400 when an invalid entity type is sent', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })
        const backup = {
            entity: 'asdf',
            entityId: projectId1
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(400)
    })

    test('returns 404 when entity doesn\'t exist', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })
        const backup = {
            entity: 'project',
            entityId: 10029101
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(404)
    })

    test('non-owner user cannot request a backup', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId })
        const backup = {
            entity: 'project',
            entityId: projectId1
        }

        // Act
        const response = await app.inject({
            method: POST,
            url: ROUTE,
            payload: backup
        })

        // Assert
        expect(response.statusCode).toBe(403)
    })
})

describe(`GET ${backupsRoute}`, async () => {
    test('returns backup requests', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })

        // Act
        const response = await app.inject({
            method: GET,
            url: backupsRoute,
            query: { entity: 'project', entityId: '2791456' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
    })

    test('returned backup requests contain the correct data', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })

        // Act
        const response = await app.inject({
            method: GET,
            url: backupsRoute,
            query: { entity: 'project', entityId: '2791456' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const results = JSON.parse(response.body)
        BACKUP_GET_PROPS.forEach(prop => { expect(results[0]).toHaveProperty(prop) })
    })

    test('throws 400 when an invalid entity type is sent', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })

        // Act
        const response = await app.inject({
            method: GET,
            url: backupsRoute,
            query: { entity: 'test', entityId: '2791456' }
        })

        // Assert
        expect(response.statusCode).toBe(400)
    })

    test('throws 404 when entity doesn\'t exist', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId: ownerId })

        // Act
        const response = await app.inject({
            method: GET,
            url: backupsRoute,
            query: { entity: 'project', entityId: '1220910' }
        })

        // Assert
        expect(response.statusCode).toBe(404)
    })

    test('non-owner user cannot fetch backup requests', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { userId })

        // Act
        const response = await app.inject({
            method: GET,
            url: ROUTE,
            query: { entity: 'project', entityId: '2791456' }
        })

        // Assert
        expect(response.statusCode).toBe(403)
    })
})
