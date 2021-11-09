import { isEmpty } from 'lodash'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ACTIVITY_PATTERN_KEYS } from '@/activity-patterns/functions'
import { TimeDataset } from '@/activity-patterns/types'
import { TimeBucket } from '~/api/species-richness-service'
import { svgToPngData } from '~/charts'
import { generateChart, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { downloadPng } from '~/utils/file'

interface DropDownOption {
  label: string
  value: string
}

const BUCKETS_TO_X_BOUNDS: Partial<Record<TimeBucket, [number, number]>> = {
  hour: [0, 23],
  day: [1, 31],
  month: [1, 12],
  quarter: [1, 4]
}

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityPatternsByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: TimeDataset[]

  selectedType = ACTIVITY_PATTERN_KEYS.detection
  datasetType: DropDownOption[] = [
    { label: 'Detection', value: ACTIVITY_PATTERN_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_PATTERN_KEYS.detectionFrequency }
  ]

  buckets: TimeBucket[] = ['hour', 'day', 'month', 'year', 'quarter']
  selectedBucket: TimeBucket = 'hour'

  get hasData (): boolean {
    return this.datasetsForSelectedBucket.some(ds => !isEmpty(ds.data))
  }

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: BUCKETS_TO_X_BOUNDS[this.selectedBucket]
    }
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket][this.selectedType] ?? [] }))
  }

  async downloadChart (): Promise<void> {
    const exportConfig = { ...this.config, width: 800, height: 450 }
    const svg = await generateChart(this.datasetsForSelectedBucket, exportConfig)
    if (!svg) return

    const png = await svgToPngData({ svg, ...exportConfig })
    downloadPng(png, `${this.domId}-${this.selectedBucket}`) // TODO 107 - Better filename
  }
}
