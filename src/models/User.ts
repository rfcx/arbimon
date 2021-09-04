import { User } from '@auth0/auth0-spa-js'

export interface Auth0User extends User {
  roles?: string[]
}
