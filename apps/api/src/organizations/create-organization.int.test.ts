import { describe, expect, test, vi } from 'vitest'

import { type CreateOrganizationResponseBody } from '@rfcx-bio/common/api-bio/organizations/create-organization'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { POST } from '~/api-helpers/types'
import { routesOrganizations } from './index'

const ROUTE = '/organizations'
const url = '/organizations'

const payload = {
  name: 'Bangkok University',
  url: 'https://www.bu.ac.th/th/',
  type: 'research-institution'
}

vi.mock('../_services/logo', () => {
  return {
    getOrganizationLogoLink: vi.fn(async () => {
      return 'https://bu.ac.th/favicon.ico'
    })
  }
})

const FAKE_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5OTI0NDk2MCwiaWF0IjoxNjk5MjQ0OTYwfQ.fWvrkz2W9K-AmQUf5g9EvldvYFxDBQ2K9UmO6oNBvlg'

const EXPECTED_PROPS = [
  'id',
  'name',
  'type',
  'url',
  'image'
]

const { Organization } = modelRepositoryWithElevatedPermissions

describe(`POST ${ROUTE} (create organization)`, () => {
  describe('simple tests', async () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesOrganizations)

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('insert successfully', async () => {
      // Arrange
      const app = await makeApp(routesOrganizations)

      // Act
      const response = await app.inject({
        method: POST,
        url,
        headers: {
          authorization: FAKE_TOKEN
        },
        payload
      })

      const json = response.json<CreateOrganizationResponseBody>()

      expect(response.statusCode).toBe(200)
      EXPECTED_PROPS.forEach(expectedProp => { expect(json).toHaveProperty(expectedProp) })

      const data = await Organization.findOne({ where: { id: json.id } })
      expect(data).toBeTruthy()
    })
  })
})
