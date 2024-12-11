import { describe, expect, test } from 'vitest'

import { searchRoute } from '@rfcx-bio/common/api-bio/search/search'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesSearch } from './index'

describe(`GET ${searchRoute}`, async () => {
  test('exists', async () => {
    // Arrange
    const app = await makeApp(routesSearch, { projectRole: 'user' })

    // Act
    const routes = [...app.routes.keys()]

    // Assert
    expect(routes).toContain(searchRoute)
  })
})
