import { Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { superProjectsRoute, superProjectTierRoute, superUserProjectsRoute, superUsersRoute, superUserTierRoute } from '@rfcx-bio/common/api-bio/super/projects'
import { getIdByRole } from '@rfcx-bio/common/roles'
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

const superUserRouteOwnerId = 1267801
const superUserRouteNoProjectUserId = 1267802
const superUserRouteProjectId = 1266600
const superUserRouteProjectId2 = 1266601

const { LocationProject, LocationProjectUserRole, UserProfile } = modelRepositoryWithElevatedPermissions

beforeAll(async () => {
  env.SUPER_USER_EMAILS = 'secret@rfcx.org,super@rfcx.org'

  await UserProfile.bulkCreate([
    {
      id: superUserRouteOwnerId,
      email: 'tier-owner@test.com',
      firstName: 'Tier',
      lastName: 'Owner',
      accountTier: 'pro',
      additionalPremiumProjectSlots: 1
    },
    {
      id: superUserRouteNoProjectUserId,
      email: 'tier-no-project@test.com',
      firstName: 'Tier',
      lastName: 'NoProject',
      accountTier: 'free',
      additionalPremiumProjectSlots: 0
    }
  ], { updateOnDuplicate: ['email', 'firstName', 'lastName', 'accountTier', 'additionalPremiumProjectSlots'] })

  await LocationProject.bulkCreate([
    {
      ...makeProject(superUserRouteProjectId, 'Published Project', 'published'),
      projectType: 'premium',
      isLocked: false
    },
    {
      ...makeProject(superUserRouteProjectId2, 'Hidden Project 2', 'hidden'),
      projectType: 'free',
      isLocked: true
    }
  ], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore', 'projectType', 'isLocked'] })

  await LocationProjectUserRole.bulkCreate([
    { locationProjectId: superUserRouteProjectId, userId: superUserRouteOwnerId, roleId: getIdByRole('owner'), ranking: 0 },
    { locationProjectId: superUserRouteProjectId2, userId: superUserRouteOwnerId, roleId: getIdByRole('owner'), ranking: 0 }
  ], { updateOnDuplicate: ['roleId', 'ranking'] })
})

afterAll(async () => {
  await LocationProjectUserRole.destroy({ where: { locationProjectId: { [Op.in]: [superUserRouteProjectId, superUserRouteProjectId2] }, userId: superUserRouteOwnerId }, force: true })
  await LocationProject.destroy({ where: { id: { [Op.in]: [superUserRouteProjectId, superUserRouteProjectId2] } }, force: true })
  await UserProfile.destroy({ where: { id: { [Op.in]: [superUserRouteOwnerId, superUserRouteNoProjectUserId] } }, force: true })
})

describe('Super projects route', async () => {
  test(`GET ${superProjectsRoute} returns unauthorized when not super user`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken: { ...userToken, email: 'someone@else.com' } })

    const response = await app.inject({
      method: GET,
      url: superProjectsRoute
    })

    expect(response.statusCode).toBe(401)
  })

  test(`GET ${superProjectsRoute} returns expected enriched results`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: GET,
      url: superProjectsRoute,
      query: { keyword: 'Published Project' }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(typeof results[0].id).toBe('number')
    expect(results[0].projectType).toBe('premium')
    expect(results[0].usage.recordingMinutesCount).toBeTypeOf('number')
    expect(results[0].limits.collaboratorCount).toBe(4)
    expect(results[0].limits.jobCount).toBe(200)
  })

  test(`GET ${superUsersRoute} returns super users with tier info`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: GET,
      url: superUsersRoute,
      query: { keyword: 'tier-owner@test.com' }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    expect(results[0].accountTier).toBe('pro')
    expect(results[0].ownedProjectCount).toBe(2)
    expect(results[0].limits.freeProjects).toBe(50)
    expect(results[0].limits.premiumProjects).toBe(3)
    expect(results[0].usage.premiumProjects).toBe(1)
  })

  test(`GET ${superUsersRoute} includes users with no owned projects`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: GET,
      url: superUsersRoute,
      query: { keyword: 'tier-no-project@test.com' }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    expect(results[0].email).toBe('tier-no-project@test.com')
    expect(results[0].ownedProjectCount).toBe(0)
    expect(results[0].usage.freeProjects).toBe(0)
    expect(results[0].usage.premiumProjects).toBe(0)
    expect(results[0].usage.unlimitedProjects).toBe(0)
  })

  test(`GET ${superUserProjectsRoute} returns owned projects for a selected user`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: GET,
      url: superUserProjectsRoute.replace(':userId', superUserRouteOwnerId.toString())
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(2)
    expect(results[0]).toHaveProperty('usage')
    expect(results[0]).toHaveProperty('limits')
  })

  test(`PATCH ${superProjectTierRoute} updates project tier`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: PATCH,
      url: superProjectTierRoute.replace(':projectId', superUserRouteProjectId.toString()),
      payload: { projectType: 'unlimited' }
    })

    expect(response.statusCode).toBe(204)

    const updated = await LocationProject.findByPk(superUserRouteProjectId)
    expect(updated?.projectType).toBe('unlimited')
  })

  test(`PATCH ${superUserTierRoute} updates user tier`, async () => {
    const app = await makeApp(routesSuper, { userId, userToken })

    const response = await app.inject({
      method: PATCH,
      url: superUserTierRoute.replace(':userId', superUserRouteOwnerId.toString()),
      payload: { accountTier: 'enterprise', additionalPremiumProjectSlots: 2 }
    })

    expect(response.statusCode).toBe(204)

    const updated = await UserProfile.findByPk(superUserRouteOwnerId)
    expect(updated?.accountTier).toBe('enterprise')
    expect(updated?.additionalPremiumProjectSlots).toBe(2)
  })
})
