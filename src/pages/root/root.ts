import { Options, Vue } from 'vue-class-component'

import { Auth0Option, Auth0User } from '@/models'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

@Options({})
export default class RootPage extends Vue {
  @VXServices.Auth.auth.VX()
  protected auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  protected user!: Auth0User | undefined

  // Logic handle
}
