import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export interface Metrics {
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
}

export default class DashboardMetrics extends Vue {
  @Prop() metrics!: Metrics
}
