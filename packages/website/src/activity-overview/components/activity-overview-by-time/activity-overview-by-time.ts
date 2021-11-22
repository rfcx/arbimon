import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { LineChartComponent } from '~/charts/line-chart'

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityOverviewByTime extends Vue {
  @Prop() domId!: string
}
