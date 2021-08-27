import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { User } from '@auth0/auth0-spa-js'

import { ROUTES_NAME } from '@/router'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

interface Authenticate {
  isAuthenticated: boolean
  loading: boolean
  user: User
  getIdTokenClaims: () => {}
  getTokenSilently: () => {}
  getTokenWithPopup: () => {}
  handleRedirectCallback: () => {}
  loginWithRedirect: () => {}
  logout: () => {}
}

@Options({})
export default class NavigationBarComponent extends Vue {
  @Inject({ from: 'auth' }) auth!: Authenticate

  public get user (): User {
    return this.auth.user
  }

  public get isAuthenticate (): boolean {
    return this.auth.isAuthenticated
  }

  public get navMenus (): NavMenus[] {
    return [
      {
        label: 'Overview',
        routerPath: ROUTES_NAME.overview
      },
      {
        label: 'Species Richness',
        routerPath: ROUTES_NAME.species_richness
      }
    ]
  }

  public async login (): Promise<void> {
    await this.auth.loginWithRedirect()
  }

  public async logout (): Promise<void> {
    await this.auth.logout()
  }
}
