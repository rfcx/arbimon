import { describe, expect, test } from 'vitest'

import { projectSpeciesRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesSpecies } from './index'

const TEST_PROJECT_ID = '40001001'
const REQUIRED_FIELDS = {
    light: ['taxonSpeciesId', 'taxonSpeciesSlug', 'scientificName', 'commonName', 'taxonClassSlug'],
    dashboard: ['slug', 'taxonSlug', 'scientificName', 'commonName', 'riskId', 'photoUrl']
}

describe(`GET ${projectSpeciesRoute}`, async () => {
    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(projectSpeciesRoute)
    })

    test('returns successfully', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', TEST_PROJECT_ID ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
    })

    test('returns data with limit', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', TEST_PROJECT_ID ?? ''),
            query: { limit: '1' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
        expect(result.species).toHaveLength(1)
    })

    test('returns default fields', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })
        const fields = 'light'
        const defaultFields = REQUIRED_FIELDS[fields]

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', TEST_PROJECT_ID ?? ''),
            query: { limit: '1' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
        defaultFields.forEach(field => { expect(result.species[0]).toHaveProperty(field) })
    })

    test('query fields=light returns the required fields', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })
        const fields = 'light'
        const defaultFields = REQUIRED_FIELDS[fields]

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', TEST_PROJECT_ID ?? ''),
            query: { fields, limit: '1' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
        defaultFields.forEach(field => { expect(result.species[0]).toHaveProperty(field) })
    })

    test('query fields=dashboard returns the required fields', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { projectRole: 'user' })
        const fields = 'dashboard'
        const dashboardFields = REQUIRED_FIELDS[fields]

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', TEST_PROJECT_ID ?? ''),
            query: { fields, limit: '1' }
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
        dashboardFields.forEach(field => { expect(result.species[0]).toHaveProperty(field) })
    })
})
