import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import NavbarComponent from '@/_layout/components/navbar/nav-bar.vue'
import { storeKey } from '@/globals'
import { BiodiversityStore } from '~/store'

@Options({
  components: { NavbarComponent }
})
export default class PreferencesPage extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
}
