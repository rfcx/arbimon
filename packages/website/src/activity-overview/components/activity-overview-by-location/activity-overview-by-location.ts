import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { generateDetectionHtmlPopup } from '@/activity-overview/components/activity-overview-by-location/functions'
import { ACTIVITY_OVERVIEW_MAP_KEYS } from '@/activity-overview/functions'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapBubbleComponent, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { MapConfig } from '~/maps/types'

interface DropdownOption {
  label: string
  value: string
}

const DEFAULT_PREFIX = 'Overview-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class ActivityOverviewByLocation extends Vue {
  @Prop({ default: [] }) datasets!: MapDataSet[]

  isShowLabels = true
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v11'
  getPopupHtml = generateDetectionHtmlPopup

  selectedDatasetType = ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency
  datasetTypes: DropdownOption[] = [
    { label: 'Detection', value: ACTIVITY_OVERVIEW_MAP_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency }
  ]

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  get hasNoData (): boolean {
    return this.datasets.length === 0
  }

  setMapStyle (style: string): void {
    this.mapStyle = style
  }

  setShowLabelsToggle (isShowLabels: boolean): void {
    this.isShowLabels = isShowLabels
  }

  mapMoved (config: MapConfig): void {
    this.config = config
  }

  mapExportName (dataset: MapDataSet, type: string): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}`, undefined, sites)
  }
}
