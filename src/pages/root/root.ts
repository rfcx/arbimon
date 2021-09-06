import { Options, Vue } from 'vue-class-component'

import { Auth0Client } from '@auth0/auth0-spa-js'

import { VXServices } from '@/services'

@Options({})
export default class RootPage extends Vue {
  @VXServices.User.user.VX()
  protected user!: Auth0Client | undefined

  async mounted (): Promise<void> {
    // await VXServices.User.user.set(new Auth0User())
  }
}
