import { describe, expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'

import { GET } from '~/api-helpers/types'
import { createApp } from './app'

describe('API Route Tests', () => {
  test('Projects API returns a list of Projects', async () => {
    // Arrange
    const app = await createApp()

    // Act
    const response = await app.inject({ method: GET, url: projectsRoute })

    // Assert
    expect(response.statusCode).toBe(200)
    // expect(response.json()).toMatchInlineSnapshot(`
    //   [
    //     {
    //       "id": 2,
    //       "latitudeNorth": 9.17229,
    //       "latitudeSouth": 9.14041,
    //       "longitudeEast": -79.81971,
    //       "longitudeWest": -79.86858,
    //       "name": "BCI-Panama_2018",
    //       "slug": "bci-panama-2018",
    //     },
    //     {
    //       "id": 3,
    //       "latitudeNorth": 18.51375,
    //       "latitudeSouth": 17.93168,
    //       "longitudeEast": -65.24505,
    //       "longitudeWest": -67.94469784,
    //       "name": "Fake Project",
    //       "slug": "fake-arbimon-project-for-bio",
    //     },
    //     {
    //       "id": 1,
    //       "latitudeNorth": 18.51375,
    //       "latitudeSouth": 17.93168,
    //       "longitudeEast": -65.24505,
    //       "longitudeWest": -67.94469784,
    //       "name": "Puerto Rico",
    //       "slug": "puerto-rico",
    //     },
    //   ]
    // `)
  })
})
