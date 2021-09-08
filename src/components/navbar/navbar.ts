import { Options, Vue } from 'vue-class-component'

import { Auth0Option, Auth0User } from '@/models'
import { NavMenus } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'

@Options({})
export default class NavBarDefaultComponent extends Vue {
  @VXServices.Auth.auth.VX()
  protected auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  protected user!: Auth0User | undefined

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

  public get isAuthenticated (): boolean {
    return this.auth?.isAuthenticated as boolean
  }

  public get userImage (): string {
    return this.user?.picture ?? ''
  }

  public async login (): Promise<void> {
    await this.auth?.loginWithRedirect()
  }

  public async logout (): Promise<void> {
    await this.auth?.logout({ returnTo: window.location.origin })
  }
}
