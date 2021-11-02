import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { TAXONOMY_CLASSES } from '~/api/taxonomy-service'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapBubbleComponent, MapConfig, MapDataSet } from '~/maps/map-bubble'

interface MapOptions {
  id: string
  name: string
}

const DEFAULT_PREFIX = 'Species-By-Site'

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class SpeciesRichnessByLocation extends Vue {
  @Prop({ default: [] }) public datasets!: MapDataSet[]

  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name
  isShowLabels = true
  mapStyleId = 'satellite-streets-v11'

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

  mapMoved (config: MapConfig): void {
    this.config = config
  }

  mapExportName (dataset: MapDataSet): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, undefined, sites)
  }
}
