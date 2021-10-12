import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Auth0Option, Auth0User } from '@/models'
import { VuexService } from '@/services'

export default class AuthNavbarItemComponent extends Vue {
  @Prop() domId!: string

  @VuexService.Auth.auth.bind()
  auth!: Auth0Option | undefined

  @VuexService.Auth.user.bind()
  user!: Auth0User | undefined

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
