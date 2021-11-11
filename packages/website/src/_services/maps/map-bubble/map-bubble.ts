import { partition } from 'lodash'
import { GeoJSONSource, LngLatBounds, Map as MapboxMap, Popup } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'
import { exportChartWithElement } from '~/charts'
import { createMap } from '~/maps'
import { generateNormalizeMapLegend } from '~/maps/export-legend'
import { MapConfig } from '~/maps/types'
import { MapDataSet, MapSiteData } from '.'

const DATA_LAYER_NONZERO_ID = 'species-information-nonzero'
const DATA_LAYER_ZERO_ID = 'species-information-zero'
const LABEL_LAYER_IDS = ['tunnel-primary-secondary-tertiary-case', 'tunnel-major-link-case', 'tunnel-motorway-trunk-case', 'tunnel-path', 'tunnel-steps', 'tunnel-major-link', 'tunnel-pedestrian', 'tunnel-primary-secondary-tertiary', 'tunnel-oneway-arrow-blue', 'tunnel-motorway-trunk', 'tunnel-oneway-arrow-white', 'ferry', 'ferry-auto', 'road-pedestrian-case', 'road-street-low', 'road-street-case', 'road-secondary-tertiary-case', 'road-primary-case', 'road-major-link-case', 'road-motorway-trunk-case', 'road-path', 'road-steps', 'road-major-link', 'road-pedestrian', 'road-street', 'road-secondary-tertiary', 'road-primary', 'road-oneway-arrow-blue', 'road-motorway-trunk', 'road-oneway-arrow-white', 'bridge-pedestrian-case', 'bridge-primary-secondary-tertiary-case', 'bridge-major-link-case', 'bridge-motorway-trunk-case', 'bridge-path', 'bridge-steps', 'bridge-major-link', 'bridge-pedestrian', 'bridge-primary-secondary-tertiary', 'bridge-oneway-arrow-blue', 'bridge-motorway-trunk', 'bridge-major-link-2-case', 'bridge-motorway-trunk-2-case', 'bridge-major-link-2', 'bridge-motorway-trunk-2', 'bridge-oneway-arrow-white', 'aerialway', 'admin-1-boundary-bg', 'admin-0-boundary-bg', 'admin-1-boundary', 'admin-0-boundary', 'admin-0-boundary-disputed', 'road-label', 'road-number-shield', 'road-exit-shield', 'waterway-label', 'natural-line-label', 'natural-point-label', 'water-line-label', 'water-point-label', 'poi-label', 'transit-label', 'airport-label', 'settlement-subdivision-label', 'settlement-label', 'state-label', 'country-label', 'settlement-minor-label', 'settlement-major-label']

const DEFAULT_COLOR = '#DDDDDD'

export default class MapBubbleComponent extends Vue {
  // Data
  @Prop() dataset!: MapDataSet
  @Prop() dataKey!: string
  @Prop() getPopupHtml!: (data: MapSiteData, dataKey: string) => string

  // Styles
  @Prop() mapId!: string
  @Prop() mapConfig!: MapConfig
  @Prop() mapExportName!: string
  @Prop({ default: 'mapbox://styles/mapbox/streets-v11' }) mapStyle!: string
  @Prop({ default: true }) isShowLabels!: boolean
  @Prop({ default: 10.0 }) maxCircleRadiusPixels!: number
  @Prop({ default: 3.0 }) minCircleRadiusPixels!: number

  @Emit() emitMapMoved (): MapConfig {
    return { sourceMapId: this.mapId, center: this.map.getCenter(), zoom: this.map.getZoom() }
  }

  map!: MapboxMap
  mapIsLoading = true
  isSynchronizingMapPosition = false

  get hasData (): boolean { return this.dataset.data.length > 0 }

  override mounted (): void {
    const mapConfig = {
      container: this.mapId,
      style: this.mapStyle,
      center: this.mapConfig.center,
      zoom: this.mapConfig.zoom,
      attributionControl: false,
      preserveDrawingBuffer: true
    }

    this.map = createMap(mapConfig)
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

    // true/false
    if (typeof value === 'boolean') {
      return value ? this.maxCircleRadiusPixels : this.minCircleRadiusPixels
    }

    // numeric continuous
    const maxValue = this.dataset.maxValues[this.dataKey]
    const normalizedValue = Math.sqrt(value / maxValue) * this.maxCircleRadiusPixels
    return normalizedValue
  }

  getPopup (datum: MapSiteData): string {
    return `<strong>${datum.siteName}: </strong>${this.getPopupHtml(datum, this.dataKey)} `
  }

  setupMapPopup (): void {
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false
    })

    // TODO CHAZ - Extract duplicate logic (ZERO vs NONZERO)
    this.map.on('mouseenter', DATA_LAYER_ZERO_ID, (e) => {
      const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
      const description = e.features?.[0].properties?.popup as string | undefined
      if (!coordinates || !description) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      this.map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map)
    })

    this.map.on('mouseleave', DATA_LAYER_ZERO_ID, () => {
      this.map.getCanvas().style.cursor = ''
      popup.remove()
    })

    this.map.on('mouseenter', DATA_LAYER_NONZERO_ID, (e) => {
      const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
      const description = e.features?.[0].properties?.popup as string | undefined
      if (!coordinates || !description) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      this.map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map)
    })

    this.map.on('mouseleave', DATA_LAYER_NONZERO_ID, () => {
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
    const [rawNonZero, rawZero] = partition(this.dataset.data, d => d.distinctSpecies[this.dataKey] === true || d.distinctSpecies[this.dataKey] > 0)

    // TODO CHAZ - Extract duplicate logic (ZERO vs NONZERO)
    // TODO 41 - Remove source/layer if dataset removed
    const dataNonZero: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: 'FeatureCollection',
      features: rawNonZero.map(datum => ({
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

    const dataZero: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: 'FeatureCollection',
      features: rawZero.map(datum => ({
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

    const sourceNonZero = this.map.getSource(DATA_LAYER_NONZERO_ID) as GeoJSONSource | undefined
    const sourceZero = this.map.getSource(DATA_LAYER_ZERO_ID) as GeoJSONSource | undefined

    if (sourceNonZero === undefined) {
      this.map.addSource(DATA_LAYER_NONZERO_ID, { type: 'geojson', data: dataNonZero })
    } else {
      sourceNonZero.setData(dataNonZero)
    }

    if (sourceZero === undefined) {
      this.map.addSource(DATA_LAYER_ZERO_ID, { type: 'geojson', data: dataZero })
    } else {
      sourceZero.setData(dataZero)
    }

    if (this.map.getLayer(DATA_LAYER_ZERO_ID) === undefined) {
      this.map.addLayer({
        id: DATA_LAYER_ZERO_ID,
        type: 'circle',
        source: DATA_LAYER_ZERO_ID,
        paint: {
          'circle-radius': this.minCircleRadiusPixels,
          'circle-color': DEFAULT_COLOR,
          'circle-stroke-width': 0.5,
          'circle-opacity': 0.8
        }
      })
    }

    if (this.map.getLayer(DATA_LAYER_NONZERO_ID) === undefined) {
      this.map.addLayer({
        id: DATA_LAYER_NONZERO_ID,
        type: 'circle',
        source: DATA_LAYER_NONZERO_ID,
        paint: {
          'circle-radius': ['max', ['get', 'radius'], this.minCircleRadiusPixels],
          'circle-color': this.dataset.color,
          'circle-stroke-width': 0.5,
          'circle-opacity': 0.65
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
    const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(coordinates[0], coordinates[0]))
    this.map.fitBounds(bounds, { padding: 40, maxZoom: 10 })
  }

  async downloadMapPng (): Promise<void> {
    const img = this.map.getCanvas().toDataURL('image/png')
    downloadPng(img, this.mapExportName)

    const { color, dataRange, maximumRadius } = this.dataset
    if (dataRange) {
      const range = dataRange[this.dataKey]
      const svg = generateNormalizeMapLegend(color, range, maximumRadius ?? range.length, 'Number of detections')

      if (!svg) return

      await exportChartWithElement(svg, 'legend-test')
    }
  }
}
