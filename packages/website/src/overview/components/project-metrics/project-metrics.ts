import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Metrics } from '@rfcx-bio/common/api-types/dashboard'

export default class ProjectMetrics extends Vue {
  @Prop() metrics!: Metrics
}
