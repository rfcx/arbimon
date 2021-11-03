import { Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { mapboxgl } from '~/maps'
import { MapFrequencyDataset } from '~/maps/map-frequency-bubble/types'
import { MapConfig } from '~/maps/types'

export default class MapFrequencyBubbleComponent extends Vue {
  @Prop() mapId!: string
  @Prop() dataset!: MapFrequencyDataset
  @Prop() mapConfig!: MapConfig
  @Prop({ default: 'mapbox://styles/mapbox/streets-v11' }) mapStyle!: string
  @Prop({ default: true }) isShowLabels!: boolean

  @Emit() emitMapMoved (): MapConfig {
    return { sourceMapId: this.mapId, center: this.map.getCenter(), zoom: this.map.getZoom() }
  }

  map!: mapboxgl.Map
  mapIsLoading = true
  isSynchronizingMapPosition = false

  get hasData (): boolean {
    return this.dataset.data.length > 0
  }

  mounted (): void {
    const mapConfig = {
      container: this.mapId,
      style: this.mapStyle,
      center: this.mapConfig.center,
      zoom: this.mapConfig.zoom,
      attributionControl: false,
      preserveDrawingBuffer: true
    }

    this.map = new mapboxgl.Map(mapConfig)
      .on('load', () => {
        this.mapIsLoading = false
        // this.generateChartNextTick()
        // this.setupMapPopup()
      })
      .on('style.load', () => {
        // this.generateChartNextTick(false)
      })
      .on('move', () => {
        if (!this.isSynchronizingMapPosition) this.emitMapMoved()
      })
  }
}
