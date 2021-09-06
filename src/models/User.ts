import { User } from '@auth0/auth0-spa-js'

export class Auth0User extends User {
  roles?: string[]
}
