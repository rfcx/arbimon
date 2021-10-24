import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { AuthClient } from '~/auth'
import { BiodiversityStore } from '~/store'

export default class AuthNavbarItemComponent extends Vue {
  @Inject() readonly auth!: AuthClient
  @Inject() readonly store!: BiodiversityStore
  @Prop() readonly domId!: string

  get userImage (): string {
    return this.store.user?.picture ?? '' // TODO 156 - Add a default picture
  }

  async login (): Promise<void> {
    await this.auth.loginWithRedirect({ appState: { redirectPath: this.$route.fullPath } })
  }

  async logout (): Promise<void> {
    await this.auth.logout()
  }
}
