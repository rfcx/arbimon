import { expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'

import { testApp } from '@/_testing/app-routes'
import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

test('GET /projects contains valid project', async () => {
  const app = await testApp(routesProject)

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)
  const result = JSON.parse(response.body)
  const bciProject = result.find((p: any) => p.slug === 'bci-panama-2018')
  expect(bciProject).toBeDefined()
  expect(bciProject.name).toBe('BCI-Panama_2018')
})
