import { Options, Vue } from 'vue-class-component'

import { Auth0User } from '@/models'
import store from '@/stores'

@Options({})
export default class Base extends Vue {
  protected user!: Auth0User
}
