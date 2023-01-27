import { Auth0Client } from '@auth0/auth0-spa-js'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { authClientKey, storeKey } from '@/globals'
import { BiodiversityStore } from '~/store'
import VersionControl from './version-control.vue'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL

@Options({
  components: {
    VersionControl
  }
})
export default class AuthNavbarItemComponent extends Vue {
  @Inject({ from: authClientKey }) readonly auth!: Auth0Client
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop() readonly domId!: string

  get userImage (): string {
    return this.store.user?.picture ?? '' // TODO 156 - Add a default picture
  }

  get isProjectMember (): boolean {
    return this.store.selectedProject?.isMyProject ?? false
  }

  async login (): Promise<void> {
    // Temporary fix to "double login" on Arbimon, previously:
    // await this.auth.loginWithRedirect({ appState: { redirectPath: this.$route.fullPath } })
    await this.auth.loginWithRedirect({ redirect_uri: `${ARBIMON_BASE_URL}/login?redirect=${window.location.href}` })
  }

  async logout (): Promise<void> {
    // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
    await this.auth.logout({ returnTo: `${ARBIMON_BASE_URL}/logout` })
  }
}
