import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import OverviewLocationComponent from './overview-location/overview-location.vue'

@Options({
  components: {
    OverviewLocationComponent
  }
})
export default class OverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
