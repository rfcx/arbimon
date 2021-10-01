import { GeoJSONSource } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { ChartModels, MapModels, TaxonomyModels } from '@/models'
import { mapboxgl } from '@/services/mapbox.service'
import { downloadPng } from '@/utils'

export default class MapBubbleComponent extends Vue {
  @Prop() mapId!: string
  @Prop() dataset!: ChartModels.MapDataSet
  @Prop() taxon!: string
  @Prop() mapConfig!: MapModels.MapConfig
  @Prop({ default: 'mapbox://styles/mapbox/streets-v11' }) mapStyle!: string

  @Emit() mapMoved (): MapModels.MapConfig {
    return { sourceMapId: this.mapId, center: this.map.getCenter(), zoom: this.map.getZoom() }
  }

  map!: mapboxgl.Map
  mapIsLoading = true
  emitMapMoves = true

  get mapIdFull (): string { return `map-bubble-${this.mapId}` }
  get hasData (): boolean { return this.dataset.data.length > 0 }

  mounted (): void {
    this.map = new mapboxgl.Map({
      container: this.mapIdFull,
      style: this.mapStyle,
      center: this.mapConfig.center,
      zoom: this.mapConfig.zoom,
      attributionControl: false,
      preserveDrawingBuffer: true
    })
      .on('load', () => {
        this.mapIsLoading = false
        this.generateChart()
      })
      .on('move', () => {
        if (this.emitMapMoves) this.mapMoved()
      })
  }

  @Watch('dataset', { deep: true }) onDataChange (): void {
    this.generateChart()
  }

  @Watch('taxon') onTaxonChange (): void {
    this.generateChart(false)
  }

  @Watch('mapConfig') onConfigChange (): void {
    if (this.mapConfig.sourceMapId === this.mapId) return // don't react to self
    this.emitMapMoves = false // don't emit for sync'd moves
    this.map.setCenter(this.mapConfig.center)
    this.map.setZoom(this.mapConfig.zoom)
    this.emitMapMoves = true
  }

  getRadius (datum: ChartModels.MapSiteData): number {
    if (this.taxon === TaxonomyModels.TAXONOMY_ALL.name) return Math.sqrt(Object.values(datum.distinctSpecies).reduce((sum, val) => sum + val, 0))
    return Math.sqrt(datum.distinctSpecies[this.taxon] ?? 0)
  }

  getPopup (datum: ChartModels.MapSiteData): string {
    const speciesCounts = Object.keys(datum.distinctSpecies).sort().map(key => `${key}: ${datum.distinctSpecies[key]}`)
    return `<strong>${datum.siteId}</strong><p>${speciesCounts.join('<br />')}</p>`
  }

  generateChart (rezoom = true): void {
    void this.$nextTick(() => this.generateChartDefferred(rezoom))
  }

  generateChartDefferred (rezoom = true): void {
    if (this.mapIsLoading || !this.hasData) return
    const map = this.map
    map.resize()

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
          title: datum.siteId,
          radius: this.getRadius(datum),
          popup: this.getPopup(datum)
        }
      })
      )
    }

    const id = 'species-richness'
    const source = map.getSource(id) as GeoJSONSource | undefined

    if (source === undefined) map.addSource(id, { type: 'geojson', data })
    else source.setData(data)

    if (map.getLayer(id) === undefined) {
      map.addLayer({
        id,
        type: 'circle',
        source: id,
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 4], // TODO 41 - Normalize circle size
          'circle-color': this.dataset.color || '#B42222',
          'circle-opacity': 0.3
        }
      })

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      map.on('mouseenter', id, (e) => {
        const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
        const description = e.features?.[0].properties?.popup as string | undefined
        if (!coordinates || !description) return

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        map.getCanvas().style.cursor = 'pointer'
        popup.setLngLat(coordinates).setHTML(description).addTo(map)
      })

      map.on('mouseleave', id, () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    }

    // TODO 41 - Merge this aggregation with the above loop
    if (rezoom) {
      const coordinates: Array<[number, number]> = this.dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number])
      if (coordinates.length === 0) return
      const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
      map.fitBounds(bounds, { padding: 40, maxZoom: 10 })
    }
  }

  downloadPng (): void {
    const img = this.map.getCanvas().toDataURL('image/png')
    downloadPng('test', img)
  }
}
