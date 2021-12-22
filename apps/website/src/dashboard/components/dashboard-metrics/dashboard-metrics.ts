import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export interface Metrics {
  detectionCount: number
  siteCount: number
  speciesCount: number
  speciesThreatenedCount: number
}

export default class DashboardMetrics extends Vue {
  @Prop() metrics!: Metrics
}
