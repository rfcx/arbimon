import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { BiodiversityStore } from '~/store'
import { TIME_BUCKET_LABELS } from '~/time-buckets'

@Options({
  components: {
    LineChartComponent
  }
})
export default class DashboardLineChart extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() timeData!: Record<number, number> | null
  @Prop() datasetType!: string

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 576,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xTitle: TIME_BUCKET_LABELS.hourOfDay,
      yTitle: this.datasetType === 'speciesRichness' ? 'Number of species' : 'Detection frequency',
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
