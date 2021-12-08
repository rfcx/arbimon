import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { generateDetectionHtmlPopup } from '@/activity-overview/components/activity-overview-by-location/functions'
import { ACTIVITY_OVERVIEW_MAP_KEYS } from '@/activity-overview/functions'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapConfig, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'

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
  mapStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateDetectionHtmlPopup

  selectedDatasetType = ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency
  datasetTypes: DropdownOption[] = [
    { label: 'Detection', value: ACTIVITY_OVERVIEW_MAP_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency },
    { label: 'Naive occupancy', value: ACTIVITY_OVERVIEW_MAP_KEYS.occupancy }
  ]

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  get hasNoData (): boolean {
    return this.datasets.length === 0
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  propagateMapMove (config: MapConfig): void { this.config = config }
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, type: string): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}`, undefined, sites)
  }
}
