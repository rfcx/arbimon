import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import * as core from '../_services/api-core/api-core'
import { routesClassifiers } from './index'

describe('GET /classifiers', async () => {
  test('get the data successfully', async () => {
    // Arrange
    const app = await makeApp(routesClassifiers)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/classifiers',
      query: {
        sort: 'name,-version',
        limit: '5',
        offset: '0'
      }
    })

    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('[0].id', 1)
    expect(json).toHaveProperty('[0].name', 'asia-elephant-edge')
    expect(json).toHaveProperty('[0].version', 5)
    expect(json).toHaveProperty('[1].id', 2)
    expect(json).toHaveProperty('[1].name', 'asia-elephant-edge')
    expect(json).toHaveProperty('[1].version', 4)
  })

  test('undefined sort params is set to undefined', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifiers')
    const app = await makeApp(routesClassifiers)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/classifiers',
      query: {
        limit: '5',
        offset: '0'
      }
    })

    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', {
      sort: undefined,
      limit: 5,
      offset: 0
    })
  })

  test('empty string sort params is set to undefined', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifiers')
    const app = await makeApp(routesClassifiers)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/classifiers',
      query: {
        sort: '',
        limit: '5',
        offset: '0'
      }
    })

    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', {
      sort: undefined,
      limit: 5,
      offset: 0
    })
  })

  test('missing limit and offset will be set', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getClassifiers')
    const app = await makeApp(routesClassifiers)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/classifiers',
      query: {
        sort: ''
      }
    })

    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', {
      sort: undefined,
      limit: 100,
      offset: 0
    })
  })
})
