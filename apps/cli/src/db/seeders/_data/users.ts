import { type UserProfile } from '@rfcx-bio/common/dao/types'

export interface UserAndRole {
  userId: number
  roleId: number // See common/src/roles
}
export interface LocationProjectAndRoles {
  slug: string
  users: UserAndRole[]
}

export const rawUsers: UserProfile[] = [
  {
    id: 9001,
    email: 'somjintana@rfcx.org',
    idAuth0: 'google-oauth2|106691636597425345169',
    firstName: 'Somjintana',
    lastName: 'K'
  },
  {
    id: 9002,
    email: 'art@rfcx.org',
    idAuth0: 'auth0|6451c69c9ea0d78b7346ea61',
    firstName: 'Bhattarapong',
    lastName: 'Somwong'
  },
  {
    id: 9003,
    email: 'oncha.tree@gmail.com',
    idAuth0: 'google-oauth2|106668036500604495330',
    firstName: 'ratree',
    lastName: 'onchana'
  },
  {
    id: 9004,
    email: 'ratree@rfcx.org',
    idAuth0: 'auth0|5fa13093c5fb6300798e93fa',
    firstName: 'Ratree',
    lastName: 'Onchana'
  },
  {
    id: 9005,
    email: 'turk@rfcx.org',
    idAuth0: 'google-oauth2|116355329881579447082',
    firstName: 'Sirirak',
    lastName: 'Phetnit'
  }
]

export const rawUsersWithRolesToProjects: LocationProjectAndRoles[] = [
  {
    slug: 'puerto-rico',
    users: [
      { userId: 9001, roleId: 1 }, // nui as owner
      { userId: 9002, roleId: 3 }, // art as guest
      { userId: 9003, roleId: 1 }, // tree as admin
      { userId: 9005, roleId: 1 }  // turk as admin
    ]
  },
  {
    slug: 'bci-panama-2018',
    users: [
      { userId: 9001, roleId: 3 }, // nui as guest
      { userId: 9005, roleId: 1 }  // turk as admin
    ]
  }
]
