import { partition } from 'lodash-es'
import { CircleLayer, CirclePaint, GeoJSONSource, LngLatBounds, LngLatBoundsLike, Map as MapboxMap, MapboxOptions, NavigationControl, Popup } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { withFileName, zipAndDownload } from '@rfcx-bio/utils/file'
import { asPromise } from '@rfcx-bio/utils/fp'

import { canvasToPngBlob, svgToCanvas } from '~/charts'
import { createMap, DEFAULT_LATITUDE, DEFAULT_LONGITUDE, MAPBOX_STYLE_SATELLITE_STREETS } from '~/maps'
import { generateMapLegend } from '~/maps/map-legend/export-legend'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { styleToPaint } from '~/maps/utils/circle-style/style-to-paint'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { MapDataSet, MapMoveEvent, MapSiteData } from './types'

const DATA_LAYER_NONZERO_ID = 'species-information-nonzero'
const DATA_LAYER_ZERO_ID = 'species-information-zero'
const DATA_LAYERS = [DATA_LAYER_ZERO_ID, DATA_LAYER_NONZERO_ID]

const LABEL_LAYER_IDS = ['tunnel-primary-secondary-tertiary-case', 'tunnel-major-link-case', 'tunnel-motorway-trunk-case', 'tunnel-path', 'tunnel-steps', 'tunnel-major-link', 'tunnel-pedestrian', 'tunnel-primary-secondary-tertiary', 'tunnel-oneway-arrow-blue', 'tunnel-motorway-trunk', 'tunnel-oneway-arrow-white', 'ferry', 'ferry-auto', 'road-pedestrian-case', 'road-street-low', 'road-street-case', 'road-secondary-tertiary-case', 'road-primary-case', 'road-major-link-case', 'road-motorway-trunk-case', 'road-path', 'road-steps', 'road-major-link', 'road-pedestrian', 'road-street', 'road-secondary-tertiary', 'road-primary', 'road-oneway-arrow-blue', 'road-motorway-trunk', 'road-oneway-arrow-white', 'bridge-pedestrian-case', 'bridge-primary-secondary-tertiary-case', 'bridge-major-link-case', 'bridge-motorway-trunk-case', 'bridge-path', 'bridge-steps', 'bridge-major-link', 'bridge-pedestrian', 'bridge-primary-secondary-tertiary', 'bridge-oneway-arrow-blue', 'bridge-motorway-trunk', 'bridge-major-link-2-case', 'bridge-motorway-trunk-2-case', 'bridge-major-link-2', 'bridge-motorway-trunk-2', 'bridge-oneway-arrow-white', 'aerialway', 'admin-1-boundary-bg', 'admin-0-boundary-bg', 'admin-1-boundary', 'admin-0-boundary', 'admin-0-boundary-disputed', 'road-label', 'road-number-shield', 'road-exit-shield', 'waterway-label', 'natural-line-label', 'natural-point-label', 'water-line-label', 'water-point-label', 'poi-label', 'transit-label', 'airport-label', 'settlement-subdivision-label', 'settlement-label', 'state-label', 'country-label', 'settlement-minor-label', 'settlement-major-label']

export default class MapBubbleComponent extends Vue {
  // Data
  @Prop() dataset!: MapDataSet
  @Prop() dataKey!: string
  @Prop() getPopupHtml!: (data: MapSiteData, dataKey: string) => string
  @Prop() mapExportName!: string

  // Styles
  @Prop() mapId!: string
  @Prop() mapInitialBounds!: LngLatBoundsLike | null
  @Prop() circleFormatter!: CircleFormatter

  // Styles (optional)
  @Prop({ default: 576 }) mapHeight!: number
  @Prop({ default: MAPBOX_STYLE_SATELLITE_STREETS }) mapStyle!: string
  @Prop({ default: true }) isShowLabels!: boolean
  @Prop({ default: DEFAULT_NON_ZERO_STYLE }) circleStyleNonZero!: CircleStyle
  @Prop({ default: DEFAULT_ZERO_STYLE }) circleStyleZero!: CircleStyle

  // Events
  @Prop({ default: null }) mapMoveEvent!: MapMoveEvent | null

  @Emit() emitMapMoved (): MapMoveEvent {
    return { sourceMapId: this.mapId, center: this.map.getCenter(), zoom: this.map.getZoom() }
  }

  map!: MapboxMap
  mapIsLoading = true
  isSynchronizingMapPosition = false

  get hasData (): boolean {
    return this.dataset.data.length > 0
  }

  override mounted (): void {
    const mapConfig: MapboxOptions = {
      container: this.mapId,
      style: this.mapStyle,
      bounds: this.mapInitialBounds ?? [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
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
      .addControl(new NavigationControl({ showCompass: false }), 'bottom-right')

    // Disable scroll zoom & all rotation
    this.map.scrollZoom.disable()
    this.map.dragRotate.disable()
    this.map.keyboard.disableRotation()
    this.map.touchZoomRotate.disableRotation()
    this.map.touchPitch.disable()
  }

  @Watch('dataset', { deep: true }) onDataChange (): void { this.generateChartNextTick() }
  @Watch('dataKey') onDataKeyChange (): void { this.generateChartNextTick(false) }
  @Watch('mapStyle') onStyleChange (currentStyle: string): void { this.map.setStyle(currentStyle) }
  @Watch('isShowLabels') onShowLabelsChange (): void { this.updateLabels() }

  @Watch('mapMoveEvent')
  onSiblingMapMove (): void {
    if (!this.mapMoveEvent || this.mapMoveEvent.sourceMapId === this.mapId) return // don't react to self
    this.isSynchronizingMapPosition = true // don't emit for sync'd moves
    this.map.setCenter(this.mapMoveEvent.center)
    this.map.setZoom(this.mapMoveEvent.zoom)
    this.isSynchronizingMapPosition = false
  }

  @Watch('mapHeight')
  onHeightChange (): void {
    this.generateChartNextTick()
  }

  getPopup (datum: MapSiteData): string {
    const value = this.getPopupHtml(datum, this.dataKey)
    return `<strong>${datum.siteName}${value ? ': ' : ''}</strong>${value}`
  }

  setupMapPopup (): void {
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false
    })

    DATA_LAYERS.forEach(layerId => {
      this.map.on('mouseenter', layerId, (e) => {
        const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
        const description = e.features?.[0].properties?.popup as string | undefined
        if (!coordinates || !description) return

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        this.map.getCanvas().style.cursor = 'pointer'
        popup.setLngLat(coordinates).setHTML(description).addTo(this.map)
      })

      this.map.on('mouseleave', layerId, () => {
        this.map.getCanvas().style.cursor = ''
        popup.remove()
      })
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

    this.updateDataSourceAndLayer(DATA_LAYER_ZERO_ID, rawZero, { ...styleToPaint(this.circleStyleZero), 'circle-radius': ['get', 'radius'] })
    this.updateDataSourceAndLayer(DATA_LAYER_NONZERO_ID, rawNonZero, { ...styleToPaint(this.circleStyleNonZero), 'circle-radius': ['get', 'radius'] })
  }

  updateDataSourceAndLayer (id: string, mapData: MapSiteData[], paint: CirclePaint): void {
    // Define map data
    const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: 'FeatureCollection',
      features: mapData.map(datum => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [datum.longitude, datum.latitude] },
        properties: {
          title: datum.siteName,
          radius: this.circleFormatter.getRadius(Number(datum.distinctSpecies[this.dataKey])), // TODO Remove this once boolean is removed from type
          popup: this.getPopup(datum)
        }
      }))
    }

    // Add source
    const source = this.map.getSource(id) as GeoJSONSource | undefined
    if (source === undefined) {
      this.map.addSource(id, { type: 'geojson', data })
    } else {
      source.setData(data)
    }

    // Add layer
    const layer = this.map.getLayer(id) as CircleLayer | undefined
    if (layer === undefined) {
      this.map.addLayer({ id, type: 'circle', source: id, paint })
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
    this.map.fitBounds(bounds, { padding: 40, maxZoom: 15 })
  }

  async downloadMapPng (): Promise<void> {
    const mapBlobPromise = canvasToPngBlob(this.map.getCanvas())
      .then(withFileName(`${this.mapExportName}.png`))

    const legendBlobPromise = asPromise(this.circleFormatter.getLegendEntries(this.circleStyleNonZero, this.circleStyleZero))
      .then(generateMapLegend)
      .then(svgToCanvas)
      .then(canvasToPngBlob)
      .then(withFileName(`${this.mapExportName}-legend.png`))

    await Promise.all([mapBlobPromise, legendBlobPromise])
      .then(async files => await zipAndDownload(files, this.mapExportName))
  }
}
