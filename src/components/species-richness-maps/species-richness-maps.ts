import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import MapBubbleComponent from '@/components/map-bubble/map-bubble.vue'
import { MapModels, TaxonomyModels } from '@/models'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/services/mapbox-service'

interface MapOptions {
  id: string
  name: string
}

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class SpeciesRichnessMaps extends Vue {
  @Prop({ default: [] }) public datasets!: MapModels.MapDataSet[]

  taxons = TaxonomyModels.TAXONOMY_CLASSES
  taxon = this.taxons[0].name
  isShowLabels = true
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

  get mapOptions (): MapOptions[] {
    return [
      {
        id: 'satellite-streets-v11',
        name: 'Satellite'
      },
      {
        id: 'streets-v11',
        name: 'Streets'
      }
    ]
  }

  get mapStyle (): string {
    return `mapbox://styles/mapbox/${this.mapStyleId}`
  }

  setMapStyle (id: string): void {
    this.mapStyleId = id
  }

  mapMoved (config: MapModels.MapConfig): void {
    this.config = config
  }
}
