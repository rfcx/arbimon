import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import NavbarComponent from '@/_layout/components/navbar/navbar.vue'
import { BiodiversityStore } from '~/store'

@Options({
  components: { NavbarComponent }
})
export default class PreferencesPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
