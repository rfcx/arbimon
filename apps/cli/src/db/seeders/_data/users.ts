import { type UserProfile } from '@rfcx-bio/common/dao/types'

export interface UserAndRole {
  userId: number
  roleId: number // TODO: add this as constant => 1 owner, ..., 3 guest
}
export interface LocationProjectAndRoles {
  slug: string
  users: UserAndRole[]
}

export const rawUsers: UserProfile[] = [
  {
    id: 1,
    email: 'somjintana@rfcx.org',
    idAuth0: 'google-oauth2|106691636597425345169',
    firstName: 'Somjintana',
    lastName: 'K'
  },
  {
    id: 2,
    email: 'art@rfcx.org',
    idAuth0: 'auth0|6451c69c9ea0d78b7346ea61',
    firstName: 'Bhattarapong',
    lastName: 'Somwong'
  }
]

export const rawUsersWithRolesToProjects: LocationProjectAndRoles[] = [
  {
    slug: 'puerto-rico',
    users: [
      { userId: 1, roleId: 1 }, // nui as owner
      { userId: 2, roleId: 3 } // art as guest
    ]
  },
  {
    slug: 'bci-panama-2018',
    users: [
      { userId: 1, roleId: 3 } // nui as guest
    ]
  }
]
