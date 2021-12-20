import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { generateDetectionHtmlPopup } from '@/activity-patterns/components/activity-patterns-by-location/functions'
import { ACTIVITY_PATTERN_MAP_KEYS } from '@/activity-patterns/functions'
import { getExportFilterName } from '~/filters'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapMoveEvent, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { BiodiversityStore } from '~/store'
 
interface DatasetType {
  label: string
  value: string
}

const DEFAULT_PREFIX = 'Patterns-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class ActivityPatternsByLocation extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: [] }) datasets!: MapDataSet[]

  selectedType = ACTIVITY_PATTERN_MAP_KEYS.detectionFrequency
  datasetTypes: DatasetType[] = [
    { label: 'Detection Frequency', value: ACTIVITY_PATTERN_MAP_KEYS.detectionFrequency },
    { label: 'Detections (raw)', value: ACTIVITY_PATTERN_MAP_KEYS.detection },
    { label: 'Naive Occupancy', value: ACTIVITY_PATTERN_MAP_KEYS.occupancy }
  ]

  isShowLabels = true
  mapStyle: MapboxStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateDetectionHtmlPopup

  mapMoveEvent: MapMoveEvent | null = null

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  get hasData (): boolean {
    return this.datasets.length > 0
  }

  propagateMapMove (mapMove: MapMoveEvent): void { this.mapMoveEvent = mapMove }
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, type: string): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}`, undefined, sites)
  }
}
