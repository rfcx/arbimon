import { isEmpty } from 'lodash'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { TimeDataset } from '@/activity-patterns/types'
import { ACTIVITY_PATTERN_TIME_KEYS, ActivityPatternsDataByTimeBucket } from '~/api/activity-patterns-service'
import { TimeBucket } from '~/api/species-richness-service'
import { svgToPngData } from '~/charts'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'

type ActivityPatternsDataByTimeType = keyof ActivityPatternsDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityPatternsDataByTimeType
}

// TODO ???: Reduce and move to somewhere for center use
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

  selectedType: ActivityPatternsDataByTimeType = ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency
  datasetType: DropDownOption[] = [
    { label: 'Detections', value: ACTIVITY_PATTERN_TIME_KEYS.detection },
    { label: 'Detection Frequency', value: ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency },
    { label: 'Naive Occupancy', value: ACTIVITY_PATTERN_TIME_KEYS.occupancy }
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
    const svg = await generateChartExport(this.datasetsForSelectedBucket, exportConfig)
    if (!svg) return

    const png = await svgToPngData({ svg, ...exportConfig })
    downloadPng(png, `${this.domId}-${this.selectedBucket}`) // TODO 107 - Better filename
  }
}
