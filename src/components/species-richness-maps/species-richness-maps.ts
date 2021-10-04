import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import MapBubbleComponent from '@/components/map-bubble/map-bubble.vue'
import { ChartModels, MapModels, TaxonomyModels } from '@/models'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/services/mapbox.service'

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class SpeciesRichnessMaps extends Vue {
  @Prop({ default: [] }) public datasets!: ChartModels.MapDataSet[]

  taxons = TaxonomyModels.TAXONOMIES
  taxon = this.taxons[0].name
  displayLabel = true
  mapStyleId = 'satellite-streets-v11'

  config: MapModels.MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  get hasData (): boolean { return this.datasets.length > 0 }
  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      case 2: case 4: return 2
      default: return 3
    }
  }

  setMapStyle (id: string) {
    this.mapStyleId = id
  }

  get mapStyle (): string {
    return `mapbox://styles/mapbox/${this.mapStyleId}`
  }

  mapMoved (config: MapModels.MapConfig): void {
    this.config = config
  }
}
