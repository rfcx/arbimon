import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'

export default class OverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
