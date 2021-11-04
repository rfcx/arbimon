import { GeoJSONSource } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { TAXONOMY_CLASS_ALL } from '~/api/taxonomy-service/taxonomy-service-mock'
import { mapboxgl } from '~/maps'
import { MapConfig } from '~/maps/types'
import { downloadPng } from '~/utils/file'
import { MapDataSet, MapSiteData } from '.'

const DATA_LAYER_ID = 'species-information'
const LABEL_LAYER_IDS = ['tunnel-primary-secondary-tertiary-case', 'tunnel-major-link-case', 'tunnel-motorway-trunk-case', 'tunnel-path', 'tunnel-steps', 'tunnel-major-link', 'tunnel-pedestrian', 'tunnel-primary-secondary-tertiary', 'tunnel-oneway-arrow-blue', 'tunnel-motorway-trunk', 'tunnel-oneway-arrow-white', 'ferry', 'ferry-auto', 'road-pedestrian-case', 'road-street-low', 'road-street-case', 'road-secondary-tertiary-case', 'road-primary-case', 'road-major-link-case', 'road-motorway-trunk-case', 'road-path', 'road-steps', 'road-major-link', 'road-pedestrian', 'road-street', 'road-secondary-tertiary', 'road-primary', 'road-oneway-arrow-blue', 'road-motorway-trunk', 'road-oneway-arrow-white', 'bridge-pedestrian-case', 'bridge-primary-secondary-tertiary-case', 'bridge-major-link-case', 'bridge-motorway-trunk-case', 'bridge-path', 'bridge-steps', 'bridge-major-link', 'bridge-pedestrian', 'bridge-primary-secondary-tertiary', 'bridge-oneway-arrow-blue', 'bridge-motorway-trunk', 'bridge-major-link-2-case', 'bridge-motorway-trunk-2-case', 'bridge-major-link-2', 'bridge-motorway-trunk-2', 'bridge-oneway-arrow-white', 'aerialway', 'admin-1-boundary-bg', 'admin-0-boundary-bg', 'admin-1-boundary', 'admin-0-boundary', 'admin-0-boundary-disputed', 'road-label', 'road-number-shield', 'road-exit-shield', 'waterway-label', 'natural-line-label', 'natural-point-label', 'water-line-label', 'water-point-label', 'poi-label', 'transit-label', 'airport-label', 'settlement-subdivision-label', 'settlement-label', 'state-label', 'country-label']

const DEFAULT_RADIUS = 5

export default class MapBubbleComponent extends Vue {
  @Prop() mapId!: string
  @Prop() dataset!: MapDataSet
  @Prop() mapConfig!: MapConfig
  @Prop() mapExportName!: string
  @Prop() getPopupHtml!: Function
  @Prop({ default: TAXONOMY_CLASS_ALL.name }) dataKey!: string
  @Prop({ default: 'mapbox://styles/mapbox/streets-v11' }) mapStyle!: string
  @Prop({ default: true }) isShowLabels!: boolean

  @Emit() emitMapMoved (): MapConfig {
    return { sourceMapId: this.mapId, center: this.map.getCenter(), zoom: this.map.getZoom() }
  }

  map!: mapboxgl.Map
  mapIsLoading = true
  isSynchronizingMapPosition = false

  get hasData (): boolean { return this.dataset.data.length > 0 }

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
        this.setupMapPopup()
      })
      .on('style.load', () => { this.generateChartNextTick(false) })
      .on('move', () => { if (!this.isSynchronizingMapPosition) this.emitMapMoved() })
  }

  @Watch('dataset', { deep: true })
  onDataChange (): void {
    this.generateChartNextTick()
  }

  @Watch('dataKey')
  onDataKeyChange (): void {
    this.generateChartNextTick(false)
  }

  @Watch('mapConfig')
  onConfigChange (): void {
    if (this.mapConfig.sourceMapId === this.mapId) return // don't react to self
    this.isSynchronizingMapPosition = true // don't emit for sync'd moves
    this.map.setCenter(this.mapConfig.center)
    this.map.setZoom(this.mapConfig.zoom)
    this.isSynchronizingMapPosition = false
  }

  @Watch('mapStyle') onStyleChange (currentStyle: string): void {
    this.map.setStyle(currentStyle)
  }

  @Watch('isShowLabels') onShowLabelsChange (): void {
    this.updateLabels()
  }

  getRadius (datum: MapSiteData): number {
    const value = datum.distinctSpecies[this.dataKey]
    const { maximumRadius, dataRange } = this.dataset
    if (dataRange) {
      const range = dataRange[this.dataKey]
      const radius = maximumRadius ?? range.length
      const belongRange = range.findIndex(r => value < r)
      const ratio = range.length / radius
      return belongRange * ratio
    }

    return (typeof value === 'boolean') ? DEFAULT_RADIUS : Math.sqrt(value)
  }

  getPopup (datum: MapSiteData): string {
    return this.getPopupHtml(datum, this.dataKey)
  }

  setupMapPopup (): void {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    this.map.on('mouseenter', DATA_LAYER_ID, (e) => {
      const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
      const description = e.features?.[0].properties?.popup as string | undefined
      if (!coordinates || !description) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      this.map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map)
    })

    this.map.on('mouseleave', DATA_LAYER_ID, () => {
      this.map.getCanvas().style.cursor = ''
      popup.remove()
    })
  }

  generateChartNextTick (rezoom = true): void {
    void this.$nextTick(() => this.generateChart(rezoom))
  }

  generateChart (rezoom = true): void {
    if (this.mapIsLoading || !this.hasData) return

    this.map.resize()
    this.updateDataSourcesAndLayers()
    this.updateLabels()
    if (rezoom) { void this.$nextTick(() => this.zoomMap()) }
  }

  updateDataSourcesAndLayers (): void {
    // TODO 41 - Remove source/layer if dataset removed
    const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: 'FeatureCollection',
      features: this.dataset.data.map(datum => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [datum.longitude, datum.latitude]
        },
        properties: {
          title: datum.siteName,
          radius: this.getRadius(datum),
          popup: this.getPopup(datum)
        }
      })
      )
    }

    const source = this.map.getSource(DATA_LAYER_ID) as GeoJSONSource | undefined

    if (source === undefined) {
      this.map.addSource(DATA_LAYER_ID, { type: 'geojson', data })
    } else {
      source.setData(data)
    }

    if (this.map.getLayer(DATA_LAYER_ID) === undefined) {
      this.map.addLayer({
        id: DATA_LAYER_ID,
        type: 'circle',
        source: DATA_LAYER_ID,
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 4], // TODO 41 - Normalize circle size
          'circle-color': this.dataset.color || '#B42222',
          'circle-stroke-width': 0.1,
          'circle-opacity': 0.6
        }
      })
    }
  }

  updateLabels (): void {
    const targetVisibility = this.isShowLabels ? 'visible' : 'none'
    this.map.getStyle().layers
      ?.map(layer => layer.id)
      ?.filter(id => LABEL_LAYER_IDS.includes(id))
      ?.forEach(id => this.map.setLayoutProperty(id, 'visibility', targetVisibility))
  }

  zoomMap (): void {
    // TODO 41 - Merge this aggregation with other loops
    const coordinates: Array<[number, number]> = this.dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number])
    if (coordinates.length === 0) return
    const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    this.map.fitBounds(bounds, { padding: 40, maxZoom: 10 })
  }

  downloadMapPng (): void {
    const img = this.map.getCanvas().toDataURL('image/png')
    downloadPng(img, this.mapExportName)
  }
}
