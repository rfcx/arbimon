import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'
import { getIdByRole } from '@rfcx-bio/common/roles'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { routesBackup } from '@/backup/index'
import { GET, POST } from '~/api-helpers/types'

const { LocationProject, LocationProjectUserRole } = modelRepositoryWithElevatedPermissions

const ROUTE = backupsRoute
const userId = 9001
const projectId = 2791456

const BACKUP_GET_PROPS = ['requested_at', 'url', 'status', 'expires_at']

beforeAll(async () => {
    const project = makeProject(projectId, 'Arctic foxes in Iceland')
    await LocationProject.create(project)
    await LocationProjectUserRole.create({ locationProjectId: projectId, userId, roleId: getIdByRole('owner'), ranking: 0 })
})

afterAll(async () => {
    await LocationProject.destroy({ where: { id: projectId }, force: true })
    await LocationProjectUserRole.destroy({ where: { locationProjectId: projectId, userId }, force: true })
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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })
        const backup = {
            entity: 'project',
            entityId: 2791456
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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })
        const backup = {
            entity: 'project',
            entityId: 2791456
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
        expect(result.backup.entity_id).toBe(2791456)
        expect(result.backup.requested_by).toBe(9001)
    })

    test('returns 400 when an invalid entity type is sent', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })
        const backup = {
            entity: 'asdf',
            entityId: 2791456
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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })
        const backup = {
            entity: 'project',
            entityId: 1002910101
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
        // TODO
    })
})

describe(`GET ${backupsRoute}`, async () => {
    test('returns backup requests', async () => {
        // Arrange
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })

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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })

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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })

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
        const app = await makeApp(routesBackup, { projectRole: 'owner', userId: 9001 })

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
        // TODO
    })
})
