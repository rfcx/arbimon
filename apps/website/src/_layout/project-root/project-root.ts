import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'

@Options({
  components: {
    InvalidProjectComponent
  }
})
export default class ProjectRoot extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
}
