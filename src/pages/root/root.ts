import { Options, Vue } from 'vue-class-component'

import NavBarComponent from '@/components/navbar/navbar.vue'
import { Auth0Option, Auth0User } from '@/models'
import { VXServices } from '@/services'

@Options({
  components: { NavBarComponent }
})
export default class RootPage extends Vue {
  @VXServices.Auth.auth.VX()
  protected auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  protected user!: Auth0User | undefined

  // Logic handle
}
