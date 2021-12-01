import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { BiodiversityStore } from '~/store'

@Options({
  components: {
    LineChartComponent
  }
})
export default class DashboardLineChart extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() timeData!: Record<number, number> | null

  get hasData (): boolean {
    return this.timeData !== null
  }

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 576,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: [0, 23]
    }
  }

  get chartData (): LineChartSeries[] {
    // Format time data into chart style
    return [{
      color: this.store.datasetColors[0],
      data: this.timeData ?? []
    }]
  }
}
