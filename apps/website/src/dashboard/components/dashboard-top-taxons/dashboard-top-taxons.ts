import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import HorizontalStackedDistribution from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution.vue'
import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'

@Options({
  components: {
    HorizontalStackedDistribution
  }
})
export default class DashboardTopTaxons extends Vue {
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Inject() readonly store!: BiodiversityStore

  @Prop() dataset!: Record<string, number>
  @Prop() colors!: Record<string, string>
  @Prop() speciesCount!: number
}
