import { Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { superProjectsRoute } from '@rfcx-bio/common/api-bio/super/projects'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import { env } from '~/env'
import { routesSuper } from './index'

const userId = 9999
const userToken = {
  email: 'super@rfcx.org',
  idAuth0: 'auth0|superuser',
  firstName: 'Super',
  lastName: 'User'
}

const { LocationProject } = modelRepositoryWithElevatedPermissions

beforeAll(async () => {
  env.SUPER_USER_EMAILS = 'secret@rfcx.org,super@rfcx.org'
  const publishedProject = makeProject(1266500, 'Published Project', 'published')
  const hiddenProject1 = makeProject(1266501, 'Hidden Project 1', 'hidden')
  const hiddenProject2 = makeProject(1266502, 'Hidden Project 2', 'hidden')
  await LocationProject.bulkCreate([publishedProject, hiddenProject1, hiddenProject2], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
})

afterAll(async () => {
  const locationProjectIds = [1266500, 1266501, 1266502]
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
})

describe('Super projects route', async () => {
  test(`GET ${superProjectsRoute} returns unauthorized when not super user`, async () => {
    // Arrange
    const app = await makeApp(routesSuper, { userId, userToken: { ...userToken, email: 'someone@else.com' } })

    // Act
    const response = await app.inject({
      method: GET,
      url: superProjectsRoute
    })

    // Assert
    expect(response.statusCode).toBe(401)
  })

  test(`GET ${superProjectsRoute} returns expected results`, async () => {
    // Arrange
    const app = await makeApp(routesSuper, { userId, userToken })

    // Act
    const response = await app.inject({
      method: GET,
      url: superProjectsRoute
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(typeof results[0].id).toBe('number')
    expect(typeof results[0].slug).toBe('string')
    expect(typeof results[0].name).toBe('string')
  })

  test(`GET ${superProjectsRoute} can filter by keyword`, async () => {
    // Arrange
    const app = await makeApp(routesSuper, { userId, userToken })

    // Act
    const response = await app.inject({
      method: GET,
      url: superProjectsRoute,
      query: { keyword: 'hidde' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(2)
  })
})
