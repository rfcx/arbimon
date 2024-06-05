import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { type LocationProjectUserRole, type UserProfile } from '@rfcx-bio/node-common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PATCH } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-stakeholders'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-stakeholders`

const FAKE_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5OTI0NDk2MCwiaWF0IjoxNjk5MjQ0OTYwfQ.fWvrkz2W9K-AmQUf5g9EvldvYFxDBQ2K9UmO6oNBvlg'

const users: UserProfile[] = [
  {
    id: 1001,
    firstName: 'Logan',
    lastName: 'Sargeant',
    email: 'logansick248@gmail.com',
    idAuth0: 'auth0|xys',
    organizationIdAffiliated: undefined
  },
  {
    id: 1002,
    firstName: 'John',
    lastName: 'Mayor',
    email: 'mayorjohns848@gmail.com',
    idAuth0: 'auth0|sqft2',
    organizationIdAffiliated: undefined
  },
  {
    id: 1003,
    firstName: 'Charles',
    lastName: 'Leclere',
    email: 'lecleresf90@rfcx.org',
    idAuth0: 'auth0|mayorsi93',
    organizationIdAffiliated: undefined
  }
]

const userRoles: LocationProjectUserRole[] = [
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1001,
    roleId: 3,
    ranking: -1
  },
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1002,
    roleId: 3,
    ranking: -1
  },
  {
    locationProjectId: Number(PROJECT_ID_BASIC),
    userId: 1003,
    roleId: 4,
    ranking: -1
  }
]

const { LocationProjectUserRole: LocationProjectUserRoleModel, UserProfile: UserProfileModel } = modelRepositoryWithElevatedPermissions

describe(`PATCH ${ROUTE} (dashboard stakeholders)`, () => {
  afterEach(async () => {
    await UserProfileModel.destroy({ where: { id: users.map(u => u.id) } })
    await LocationProjectUserRoleModel.destroy({ where: { locationProjectId: PROJECT_ID_BASIC } })
  })

  beforeEach(async () => {
    await UserProfileModel.bulkCreate(users)
    await LocationProjectUserRoleModel.bulkCreate(userRoles)
  })

  test('partial update to user role', async () => {
    // Arrange
    const app = await makeApp(routesDashboard, { projectRole: 'admin' })

    // Act
    const response = await app.inject({
      method: PATCH,
      url,
      headers: {
        authorization: FAKE_TOKEN
      },
      payload: {
        organizations: [],
        users: [{ userId: 1001, ranking: 0 }]
      }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const data = await LocationProjectUserRoleModel.findOne({ where: { locationProjectId: PROJECT_ID_BASIC, userId: 1001 }, plain: true })
    expect(data?.ranking).toBe(0)
  })
})
