import { describe } from 'vitest'

import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesBackup } from '@/backup/index'

describe(`POST ${backupsRoute}`, async () => {
    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesBackup)

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(backupsRoute)
    })

    test('creates a backup request successfully', async () => {

    })
    test('created and returned backup request contains the correct information', () => {})
    test('throws an error when an invalid entity type is sent', () => {})
    test('throws 404 when entity doesn\'t exist', () => {})
    test('non-owner user cannot request a backup', () => {})
})

describe(`GET ${backupsRoute}`, async () => {
    test('returns backup requests', () => {})
    test('returned backup requests contain the correct data', () => {})
    test('throws an error when an invalid entity type is sent', () => {})
    test('throws 404 when entity doesn\'t exist', () => {})
    test('non-owner user cannot fetch backup requests', () => {})
})
