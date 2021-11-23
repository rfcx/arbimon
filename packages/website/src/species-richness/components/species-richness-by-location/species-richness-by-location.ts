import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { generateHtmlPopup } from '@/species-richness/components/species-richness-by-location/functions'
import { TAXONOMY_CLASSES } from '~/api/taxonomy-service'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { MapBubbleComponent, MapConfig, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Prop({ default: [] }) public datasets!: MapDataSet[]

  taxon = TAXONOMY_CLASSES[0].name
  taxons = TAXONOMY_CLASSES

  isShowLabels = true
  mapStyle: MapboxStyle = MAPBOX_STYLE_SATELLITE_STREETS // TODO: Encapsulate this under BubbleMapGroup
  getPopupHtml = generateHtmlPopup

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
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

  propagateTaxonomyValue (taxon: string): void { this.taxon = taxon }
  propagateMapMove (config: MapConfig): void { this.config = config }
  propagateMapStyle (style: MapboxStyle): void { this.mapStyle = style }
  propagateToggleLabels (isShowLabels: boolean): void { this.isShowLabels = isShowLabels }

  mapExportName (dataset: MapDataSet): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, undefined, sites)
  }
}
