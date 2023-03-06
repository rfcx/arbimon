import { LngLatBoundsLike } from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { LAYOUT_BREAKPOINT } from '@/_layout/config'
import { storeKey } from '@/globals'
import { generateHtmlPopup } from '@/species-richness/components/species-richness-by-location/functions'
import { MAP_KEY_RICHNESS_TOTAL } from '@/species-richness/functions'
import { getExportFilterName } from '~/filters'
import { MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_SATELLITE_STREETS, MapboxGroundStyle, MapboxStatisticsStyle } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { MapBaseFormatter, MapDataSet, MapMoveEvent } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBaseComponent,
    MapToolMenuComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop({ default: [] }) public datasets!: MapDataSet[]
  @Prop({ default: true }) loading!: boolean

  isShowLabels = true
  mapGroundStyle: MapboxGroundStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  mapStatisticsStyle: MapboxStatisticsStyle = MAPBOX_STYLE_HEATMAP
  getPopupHtml = generateHtmlPopup

  mapMoveEvent: MapMoveEvent | null = null
  mapHeight = screen.width > LAYOUT_BREAKPOINT.sm ? 576 : 288

  get hasData (): boolean {
    return !this.loading && this.datasets.length > 0
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  get mapDataKey (): string {
    return MAP_KEY_RICHNESS_TOTAL
  }

  get mapInitialBounds (): LngLatBoundsLike | null {
    const project = this.store.selectedProject
    if (!project) return null
    return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
  }

  get circleFormatter (): MapBaseFormatter {
    // ! After connect to the api, there is a case where `maxValueRaw` = -Infinity
    // ! Have to investigate more
    return new CircleFormatterNormalizedWithMin({ maxValueRaw: Math.max(0, this.datasets[0].maxValues[this.mapDataKey]) })
  }

  get circleStyles (): CircleStyle[] {
    return this.datasets.map((d, idx) => ({ ...DEFAULT_NON_ZERO_STYLE, color: this.store.datasetColors[idx] }))
  }

  override created (): void {
    window.addEventListener('resize', () => {
      this.mapHeight = screen.width > LAYOUT_BREAKPOINT.sm ? 576 : 288
    })
  }

  propagateMapMove (mapMove: MapMoveEvent): void { this.mapMoveEvent = mapMove }
  propagateMapGroundStyle (style: MapboxGroundStyle): void { this.mapGroundStyle = style }
  propagateMapStatisticsStyle (style: MapboxStatisticsStyle): void { this.mapStatisticsStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, datasetIndex: number): string {
    const { startDate, endDate, sites } = dataset
    const siteGroup = sites.map(s => ({ label: s.name, value: [s] }))

    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, datasetIndex, undefined, siteGroup)
  }
}
