import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

interface ProjectMetrics {
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
}

export default class OverviewMetrics extends Vue {
  @Prop() metrics!: ProjectMetrics
}
