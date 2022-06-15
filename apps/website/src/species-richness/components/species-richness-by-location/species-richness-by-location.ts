import { LngLatBoundsLike } from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { LAYOUT_BREAKPOINT } from '@/_layout/config'
import { storeKey } from '@/globals'
import { generateHtmlPopup } from '@/species-richness/components/species-richness-by-location/functions'
import { MAP_KEY_RICHNESS_TOTAL } from '@/species-richness/functions'
import { getExportFilterName } from '~/filters'
import { MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapDataSet, MapMoveEvent } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop({ default: [] }) public datasets!: MapDataSet[]

  isShowLabels = true
  mapStyle: MapboxStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateHtmlPopup

  mapMoveEvent: MapMoveEvent | null = null
  mapHeight = screen.width > LAYOUT_BREAKPOINT.sm ? 576 : 288

  get hasData (): boolean {
    return this.datasets.length > 0
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

  get circleFormatter (): CircleFormatter {
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
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet, datasetIndex: number): string {
    const { startDate, endDate, sites } = dataset
    const siteGroup = sites.map(s => ({ label: s.name, value: [s] }))

    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, datasetIndex, undefined, siteGroup)
  }
}
