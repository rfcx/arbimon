import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'
import { updateClassifierJobRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

vi.mock('../_services/api-core/api-core')

describe(`PATCH ${updateClassifierJobRoute}`, async () => {
    test('updates the data successfully and returns 204', async () => {
        // Arrange
        // const app = await makeApp(routesCnn, {
        //     projectRole: 'user'
        // })
        //
        // // Act
        // const response = await app.inject({
        //     method: 'PATCH',
        //     url: '/detections/review',
        //     payload: {
        //         status: 'notPresent',
        //         classifierId: 12,
        //         classificationValue: 'scheluris_carolinensis_simple_call_2',
        //         jobId: 225,
        //         start: '2022-01-05T12:00:00.000+0000',
        //         siteIdCore: 'kd9583ig385o'
        //     }
        // })
        //
        // // Assert
        // expect(response.statusCode).toEqual(204)
    })
})