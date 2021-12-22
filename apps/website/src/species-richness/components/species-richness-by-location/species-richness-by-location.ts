import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { generateHtmlPopup } from '@/species-richness/components/species-richness-by-location/functions'
import { TAXONOMY_CLASS_ALL } from '~/api/taxonomy-service'
import { getExportFilterName } from '~/filters'
import { MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapDataSet, MapMoveEvent } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: [] }) public datasets!: MapDataSet[]

  isShowLabels = true
  mapStyle: MapboxStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateHtmlPopup

  mapMoveEvent: MapMoveEvent | null = null

  get mapDataKey (): string {
    return TAXONOMY_CLASS_ALL.name
  }

  get hasData (): boolean {
    return this.datasets.length > 0
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      default: return 2
    }
  }

  propagateMapMove (mapMove: MapMoveEvent): void { this.mapMoveEvent = mapMove }
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, undefined, sites)
  }
}
