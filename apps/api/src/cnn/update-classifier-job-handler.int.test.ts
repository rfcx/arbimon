import { describe, expect, test, vi } from 'vitest'

import { updateClassifierJobRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PATCH } from '~/api-helpers/types'
import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

const jobId = 22
const url = `/jobs/${jobId}`

describe(`PATCH ${updateClassifierJobRoute}`, async () => {
    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesCnn, {
            projectRole: 'user',
            userToken: {
                email: 'whoami@rfcx.org'
            }
        })

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(updateClassifierJobRoute)
    })
    test('returns successfully', async () => {
        // Arrange
        const app = await makeApp(routesCnn, {
            projectRole: 'user',
            userToken: {
                email: 'whoami@rfcx.org'
            }
        })

        // Act
        const response = await app.inject({
            method: PATCH,
            url,
            payload: {
                status: 50
            }
        })

        // Assert
        expect(response.statusCode).toBe(204)
    })
    test('returns an error when an invalid status is sent', async () => {
        // Arrange
        const app = await makeApp(routesCnn, {
            projectRole: 'user',
            userToken: {
                email: 'whoami@rfcx.org'
            }
        })

        // Act
        const response = await app.inject({
            method: PATCH,
            url,
            payload: {
                status: 20
            }
        })

        expect(response.statusCode).toBe(400)
    })
})
