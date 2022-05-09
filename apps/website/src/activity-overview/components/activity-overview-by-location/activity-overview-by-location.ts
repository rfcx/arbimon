import { LngLatBoundsLike } from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { generateDetectionHtmlPopup } from '@/activity-overview/components/activity-overview-by-location/functions'
import { ACTIVITY_OVERVIEW_MAP_KEYS } from '@/activity-overview/functions'
import { getExportFilterName } from '~/filters'
import { MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapDataSet, MapMoveEvent } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { CircleFormatterBinary } from '~/maps/utils/circle-formatter/circle-formatter-binary'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { BiodiversityStore } from '~/store'

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
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: [] }) datasets!: MapDataSet[]

  isShowLabels = true
  mapStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateDetectionHtmlPopup

  selectedType = ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency
  datasetTypes: DropdownOption[] = [
    { label: 'Detection Frequency', value: ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency },
    { label: 'Detections (raw)', value: ACTIVITY_OVERVIEW_MAP_KEYS.detection },
    { label: 'Naive Occupancy', value: ACTIVITY_OVERVIEW_MAP_KEYS.occupancy }
  ]

  mapMoveEvent: MapMoveEvent | null = null

  get hasNoData (): boolean {
    return this.datasets.length === 0
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  get mapInitialBounds (): LngLatBoundsLike | null {
    const project = this.store.selectedProject
    if (!project) return null
    return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
  }

  get circleFormatter (): CircleFormatter {
    return this.selectedType === ACTIVITY_OVERVIEW_MAP_KEYS.occupancy
      ? new CircleFormatterBinary()
      : new CircleFormatterNormalizedWithMin({ maxValueRaw: this.datasets[0].maxValues[this.selectedType] })
  }

  get circleStyles (): CircleStyle[] {
    return this.datasets.map((d, idx) => ({ ...DEFAULT_NON_ZERO_STYLE, color: this.store.datasetColors[idx] }))
  }

  propagateMapMove (mapMoveEvent: MapMoveEvent): void { this.mapMoveEvent = mapMoveEvent }
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, type: string, datasetIndex: number): string {
    const { startDate, endDate, sites } = dataset
    const siteGroup = sites.map(s => ({ label: s.name, sites: [s] }))

    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}`, datasetIndex, undefined, siteGroup)
  }
}
