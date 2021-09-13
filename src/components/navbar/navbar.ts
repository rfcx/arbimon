import { Options, Vue } from 'vue-class-component'

import { Auth0Option, Auth0User } from '@/models'
import { NavMenu } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'

@Options({})
export default class NavBarDefaultComponent extends Vue {
  @VXServices.Auth.auth.VX()
  public auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  public user!: Auth0User | undefined

  public get navMenus (): NavMenu[] {
    return [
      {
        label: 'Overview',
        destination: ROUTES_NAME.overview
      },
      {
        label: 'Species Richness',
        destination: ROUTES_NAME.species_richness
      }
    ]
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
