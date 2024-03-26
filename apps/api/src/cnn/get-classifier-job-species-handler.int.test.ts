import { describe, expect, test, vi } from 'vitest'

import { xTotalSpeciesCountHeaderName } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as core from '../_services/api-core/api-core'
import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

const jobId = 37

describe('GET /jobs/:jobId/species', async () => {
  test('the route is successful to be called', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '25',
        offset: '0',
        q: '',
        sort: 'name'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(response.headers?.[xTotalSpeciesCountHeaderName]).toEqual(92)
    const json = response.json()
    expect(Array.isArray(json)).toBeTruthy()
    expect(json[0]).toBeDefined()
    expect(json[0]).toHaveProperty('title', 'Calciformis Cannabis')
    expect(json[0]).toHaveProperty('unvalidated', 1)
    expect(json[0]).toHaveProperty('unknown', 2)
    expect(json[0]).toHaveProperty('present', 5)
    expect(json[0]).toHaveProperty('notPresent', 0)

    expect(json[1]).toBeDefined()
    expect(json[1]).toHaveProperty('title', 'Doodoo Cyphleris')
    expect(json[1]).toHaveProperty('unvalidated', 1)
    expect(json[1]).toHaveProperty('unknown', 4)
    expect(json[1]).toHaveProperty('present', 3)
    expect(json[1]).toHaveProperty('notPresent', 2)

    expect(json[2]).not.toBeDefined()
  })

  test('non rfcx email will not be able to access the route', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'support@nicholaslatifi.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '25',
        offset: '0',
        q: '',
        sort: 'name'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(403)
  })

  test('given limit offset will be parsed correctly', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '200',
        offset: '100',
        q: '',
        sort: 'name'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 200, offset: 100, keyword: undefined, sort: 'name' })
  })

  test('given sort criteria is parsed correctly', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '200',
        offset: '100',
        q: '',
        sort: 'name,-unvalidated,-present'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 200, offset: 100, keyword: undefined, sort: 'name,-unreviewed,-confirmed' })
  })

  test('other sort criteria are removed from the final sort results without the order change', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '200',
        offset: '100',
        q: '',
        sort: 'name,-who,-present'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 200, offset: 100, keyword: undefined, sort: 'name,-confirmed' })
  })

  test('missing limit will automatically be set at 25', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        offset: '100',
        sort: 'name'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 25, offset: 100, keyword: undefined, sort: 'name' })
  })

  test('there\'s no limit to how high you can set your offset to', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '100000',
        offset: '1000000',
        q: 'who',
        sort: 'name'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 100000, offset: 1000000, keyword: 'who', sort: 'name' })
  })

  test('invalid sort params will not be passed to core', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '100000',
        offset: '1000000',
        q: 'who2',
        sort: 'what'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 100000, offset: 1000000, keyword: 'who2', sort: undefined })
  })

  test('undefined sort params gets passed to core with undefined', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '100000',
        offset: '1000000',
        q: 'who2'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 100000, offset: 1000000, keyword: 'who2', sort: undefined })
  })

  test('empty string `q` should get converted to undefined when passed to core function', async () => {
     // Arrange
    const spy = vi.spyOn(core, 'getClassifierJobSummaries')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'nicholaslatifi92@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/species`,
      query: {
        limit: '100000',
        offset: '1000000',
        q: '',
        sort: 'name',
        order: 'desc'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', 37, { limit: 100000, offset: 1000000, keyword: undefined, sort: 'name' })
 })
})
