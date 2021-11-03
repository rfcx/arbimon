import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { mapboxgl } from '~/maps'
import { MapFrequencyDataset } from '~/maps/map-frequency-bubble/types'
import { MapConfig } from '~/maps/types'

const DATA_LAYER_ID = 'activity-patterns'

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
    return Object.values(this.dataset.data).length > 0
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
        this.generateChartNextTick()
      // this.setupMapPopup()
      })
      .on('style.load', () => {
        this.generateChartNextTick(false)
      })
      .on('move', () => {
        if (!this.isSynchronizingMapPosition) this.emitMapMoved()
      })
  }

  @Watch('dataset', { deep: true })
  onDataChange (): void {
    this.generateChartNextTick()
  }

  generateChartNextTick (rezoom = true): void {
    void this.$nextTick(() => this.generateChart(rezoom))
  }

  generateChart (rezoom = true): void {
    if (this.mapIsLoading || !this.hasData) return

    this.map.resize()
    this.updateDataSourcesAndLayers()
    // this.updateLabels()
    if (rezoom) { void this.$nextTick(() => this.zoomMap()) }
  }

  updateDataSourcesAndLayers (): void {
    // const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    //   type: 'FeatureCollection',
    //   features: this.dataset.data.map(datum => ({
    //     type: 'Feature',
    //     geometry: {
    //       type: 'Point',
    //       coordinates: [datum.longitude, datum.latitude]
    //     },
    //     properties: {
    //       title: datum.siteName
    //     }
    //   })
    //   )
    // }

    // const source = this.map.getSource(DATA_LAYER_ID) as GeoJSONSource | undefined

    // if (source === undefined) {
    //   this.map.addSource(DATA_LAYER_ID, { type: 'geojson', data })
    // } else {
    //   source.setData(data)
    // }

    if (this.map.getLayer(DATA_LAYER_ID) === undefined) {
      this.map.addLayer({
        id: DATA_LAYER_ID,
        type: 'circle',
        source: DATA_LAYER_ID,
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 4], // TODO 41 - Normalize circle size
          'circle-color': this.dataset.color || '#B42222',
          'circle-opacity': 0.6
        }
      })
    }
  }

  zoomMap (): void {
    // TODO 41 - Merge this aggregation with other loops
    const coordinates: Array<[number, number]> = this.dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number])
    if (coordinates.length === 0) return
    const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    this.map.fitBounds(bounds, { padding: 40, maxZoom: 10 })
  }
}
