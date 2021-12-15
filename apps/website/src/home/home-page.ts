import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import NavbarComponent from '@/_layout/components/navbar/nav-bar.vue'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

@Options({
  components: { NavbarComponent }
})
export default class HomePage extends Vue {
  @Inject() readonly store!: BiodiversityStore

  get dashboardRoutename (): string {
    return ROUTE_NAMES.dashboard
  }
}
