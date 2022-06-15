import numeral from 'numeral'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpotlightDataByTime } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { downloadSvgAsPng } from '~/charts'
import { DEFAULT_YAXIS_LINE_FORMAT, generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABEL_FORMATTERS, TimeBucket } from '~/time-buckets'
import { ACTIVITY_PATTERN_TIME_KEYS, ActivityPatternsDataByTimeBucket } from '../../types'

type ActivityPatternsDataByTimeType = keyof ActivityPatternsDataByTimeBucket

export interface SpotlightTimeDataset {
  color: string
  data: SpotlightDataByTime
}

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityPatternsDataByTimeType
}

const SECONDS_PER_DAY = 86400 // 24 * 60 * 60

const DATASET_LABELS = {
  [ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency]: 'Detection Frequency',
  [ACTIVITY_PATTERN_TIME_KEYS.detection]: 'Detections (raw)'
}

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityPatternsByTime extends Vue {
  @Prop() domId!: string
  @Prop() species!: SpeciesInProjectLight
  @Prop() datasets!: SpotlightTimeDataset[]

  selectedType: ActivityPatternsDataByTimeType = ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency
  datasetType: DropDownOption[] = [
    { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency], value: ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency },
    { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detection], value: ACTIVITY_PATTERN_TIME_KEYS.detection }
  ]

  selectedBucket: TimeBucket = 'hourOfDay'
  buckets: Record<TimeBucket, string> = TIME_BUCKET_LABELS

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 10, bottom: 30, left: 40 },
      xTitle: TIME_BUCKET_LABELS[this.selectedBucket],
      yTitle: DATASET_LABELS[this.selectedType],
      xBounds: TIME_BUCKET_BOUNDS[this.selectedBucket],
      xLabelFormatter: this.selectedBucket === 'dateSeries'
        ? n => dayjs.unix(n * SECONDS_PER_DAY).format('MMM-DD YY')
        : TIME_LABEL_FORMATTERS[this.selectedBucket],
      yLabelFormatter: this.displayWholeNumber
        ? (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
        : DEFAULT_YAXIS_LINE_FORMAT
    }
  }

  get displayWholeNumber (): boolean {
    return this.selectedType === this.datasetType[1].value
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket][this.selectedType] ?? [] }))
  }

  get hasData (): boolean {
    return this.datasetsForSelectedBucket
      .some(ds => Object.values(ds.data).some(val => val > 0))
  }

  async downloadChart (): Promise<void> {
    const margins = { ...this.config.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.config, margins, width: 1024, height: 576 }
    const svg = generateChartExport(this.datasetsForSelectedBucket, exportConfig)
    if (!svg) return

    await downloadSvgAsPng(svg, getExportGroupName(`${this.domId}-${this.selectedBucket}--${this.species.taxonSpeciesSlug}`))
  }
}
