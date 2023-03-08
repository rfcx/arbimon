import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import NavbarComponent from '@/_layout/components/navbar/nav-bar.vue'
import { storeKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { type BiodiversityStore } from '~/store'

@Options({
  components: { NavbarComponent }
})
export default class HomePage extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  get dashboardRoutename (): string {
    return ROUTE_NAMES.dashboard
  }
}
