import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import NavbarComponent from '../components/navbar/nav-bar.vue'

@Options({
  components: {
    NavbarComponent,
    InvalidProjectComponent
  }
})
export default class ProjectRoot extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
