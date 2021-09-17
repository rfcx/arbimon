import { Vue } from 'vue-class-component'

import { Auth0Option, Auth0User } from '@/models'
import { VXServices } from '@/services'

export default class AuthNavbarItemComponent extends Vue {
  @VXServices.Auth.auth.VX()
  public auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  public user!: Auth0User | undefined

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
