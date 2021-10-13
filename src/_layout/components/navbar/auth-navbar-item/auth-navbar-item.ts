import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Auth0Option, Auth0User } from '@/_services/auth/types'
import { VuexAuth } from '@/_services/store'

export default class AuthNavbarItemComponent extends Vue {
  @Prop() domId!: string
  @VuexAuth.auth.bind() auth!: Auth0Option | undefined
  @VuexAuth.user.bind() user!: Auth0User | undefined

  get userImage (): string {
    return this.user?.picture ?? ''
  }

  async login (): Promise<void> {
    await this.auth?.loginWithRedirect({ appState: { redirectPath: this.$route.fullPath } })
  }

  async logout (): Promise<void> {
    await this.auth?.logout({ returnTo: window.location.origin })
  }
}
