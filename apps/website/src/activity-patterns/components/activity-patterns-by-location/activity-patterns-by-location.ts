import { LngLatBoundsLike } from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { generateDetectionHtmlPopup } from '@/activity-patterns/components/activity-patterns-by-location/functions'
import { SPOTLIGHT_MAP_KEYS } from '@/activity-patterns/functions'
import { storeKey } from '@/globals'
import { getExportFilterName } from '~/filters'
import { MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapDataSet, MapMoveEvent } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { CircleFormatterBinary } from '~/maps/utils/circle-formatter/circle-formatter-binary'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { BiodiversityStore } from '~/store'

interface DatasetType {
  label: string
  value: string
}

const DEFAULT_PREFIX = 'Spotlight-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class ActivityPatternsByLocation extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop() species!: SpeciesInProjectTypes['light']
  @Prop({ default: [] }) datasets!: MapDataSet[]

  selectedType = SPOTLIGHT_MAP_KEYS.detectionFrequency
  datasetTypes: DatasetType[] = [
    { label: 'Detection Frequency', value: SPOTLIGHT_MAP_KEYS.detectionFrequency },
    { label: 'Detections (raw)', value: SPOTLIGHT_MAP_KEYS.count },
    { label: 'Naive Occupancy', value: SPOTLIGHT_MAP_KEYS.occupancy }
  ]

  isShowLabels = true
  mapGroundStyle: MapboxStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  mapStatisticsStyle: MapboxStyle = MAPBOX_STYLE_HEATMAP // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateDetectionHtmlPopup

  mapMoveEvent: MapMoveEvent | null = null

  get hasData (): boolean {
    return this.datasets.length > 0
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
    return this.selectedType === SPOTLIGHT_MAP_KEYS.occupancy
      ? new CircleFormatterBinary()
      : new CircleFormatterNormalizedWithMin({ maxValueRaw: this.datasets[0].maxValues[this.selectedType] })
  }

  get circleStyles (): CircleStyle[] {
    return this.datasets.map((d, idx) => ({ ...DEFAULT_NON_ZERO_STYLE, color: this.store.datasetColors[idx] }))
  }

  propagateMapMove (mapMove: MapMoveEvent): void { this.mapMoveEvent = mapMove }
  propagateMapGroundStyle (style: MapboxStyle): void { this.mapGroundStyle = style }
  propagateMapStatisticsStyle (style: MapboxStyle): void { this.mapStatisticsStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, type: string, datasetIndex: number): string {
    const { startDate, endDate, sites } = dataset
    const siteGroup = sites.map(s => ({ label: s.name, value: [s] }))

    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}--${this.species.taxonSpeciesSlug}`, datasetIndex, undefined, siteGroup)
  }
}
