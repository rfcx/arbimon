import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { generateHtmlPopup } from '@/species-richness/components/species-richness-by-location/functions'
import { TAXONOMY_CLASS_ALL } from '~/api/taxonomy-service'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapBubbleComponent, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { MapConfig } from '~/maps/types'

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Prop({ default: [] }) public datasets!: MapDataSet[]

  isShowLabels = true
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v11'
  getPopupHtml = generateHtmlPopup

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

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

  setMapStyle (style: string): void {
    this.mapStyle = style
  }

  setShowLabelsToggle (isShowLabels: boolean): void {
    this.isShowLabels = isShowLabels
  }

  mapMoved (config: MapConfig): void {
    this.config = config
  }

  mapExportName (dataset: MapDataSet): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, undefined, sites)
  }
}
