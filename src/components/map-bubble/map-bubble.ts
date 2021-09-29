import { GeoJSONSource } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, mapboxgl } from '@/services/mapbox.service'

interface TaxonomyOption {
  symbol: string
  name: string
}

const TAXONOMY_ALL: TaxonomyOption = { name: 'All', symbol: 'Σ' }
const TAXONOMIES: TaxonomyOption[] = [TAXONOMY_ALL, { name: 'Amphibians', symbol: '🐸' }, { name: 'Birds', symbol: '🐦' }]

export default class MapBubbleComponent extends Vue {
  @Prop({ default: [] }) public datasets!: ChartModels.MapDataSet[]

  taxons = TAXONOMIES
  taxon = this.taxons[0].name

  map!: mapboxgl.Map
  mapIsLoading = true

  get hasData (): boolean { return this.datasets.length > 0 && this.datasets.some(ds => ds.data.length > 0) }

  mounted (): void {
    this.map = new mapboxgl.Map({
      container: 'map-bubble',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: 9
    })
      .on('load', () => {
        this.mapIsLoading = false
        void this.$nextTick(() => this.generateChart())
      })
  }

  @Watch('datasets', { deep: true }) onDataChange (): void {
    void this.$nextTick(() => this.generateChart())
  }

  @Watch('taxon') onMapConfigChange (): void {
    void this.$nextTick(() => this.generateChart(false))
  }

  getRadius (datum: ChartModels.MapSiteData): number {
    if (this.taxon === TAXONOMY_ALL.name) return Math.sqrt(Object.values(datum.distinctSpecies).reduce((sum, val) => sum + val, 0))
    return Math.sqrt(datum.distinctSpecies[this.taxon] ?? 0)
  }

  getPopup (datum: ChartModels.MapSiteData): string {
    const speciesCounts = Object.keys(datum.distinctSpecies).sort().map(key => `${key}: ${datum.distinctSpecies[key]}`)
    return `<strong>${datum.siteId}</strong><p>${speciesCounts.join('<br />')}</p>`
  }

  generateChart (rezoom = true): void {
    if (this.mapIsLoading || !this.hasData) return
    const map = this.map
    map.resize()

    // TODO 41 - Remove source/layer if dataset removed
    this.datasets.forEach((dataset, idx) => {
      const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: dataset.data.map(datum => ({
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

      const id = `species-richness-${idx}`
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
            'circle-color': dataset.color || '#B42222',
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
    })

    // TODO 41 - Merge this aggregation with the above loop
    if (rezoom) {
      const coordinates: Array<[number, number]> = this.datasets.flatMap(dataset => dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number]))
      if (coordinates.length === 0) return
      const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
      map.fitBounds(bounds, { padding: 40, maxZoom: 10 })
    }
  }
}
