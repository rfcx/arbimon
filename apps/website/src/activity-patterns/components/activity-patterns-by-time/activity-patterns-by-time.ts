import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { TimeDataset } from '@/activity-patterns/types'
import { ACTIVITY_PATTERN_TIME_KEYS, ActivityPatternsDataByTimeBucket } from '~/api/activity-patterns-service'
import { svgToPngData } from '~/charts'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABELS, TimeBucket } from '~/time-buckets'

type ActivityPatternsDataByTimeType = keyof ActivityPatternsDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityPatternsDataByTimeType
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
    { label: 'Detection Frequency', value: ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency },
    { label: 'Detections (raw)', value: ACTIVITY_PATTERN_TIME_KEYS.detection }
  ]

  selectedBucket: TimeBucket = 'hourOfDay'
  buckets: Record<TimeBucket, string> = TIME_BUCKET_LABELS

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: TIME_BUCKET_BOUNDS[this.selectedBucket],
      xLabels: TIME_LABELS[this.selectedBucket]
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
