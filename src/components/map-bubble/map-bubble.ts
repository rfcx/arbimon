import mapboxgl from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicmZjeCIsImEiOiJoMEptMnlJIn0.LPKrjG_3AeYB5cqsyLpcrg'
export const MAPBOX_STYLE = 'mapbox://styles/rfcx/ckapdhmby26zo1io3nqd84dsd'
export const MAPBOX_STYLE_WITH_PLACE_LABELS = 'mapbox://styles/rfcx/ck9g6dci83g3x1io8dl27r7aq'

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

export default class MapBubbleComponent extends Vue {
  @Prop({ default: [] }) public datasets!: ChartModels.MapDataSet[]

  map!: mapboxgl.Map
  mapIsReady = false
  taxon = 'Birds'

  get noData (): boolean { return this.datasets.length === 0 }

  mounted (): void {
    this.map = new mapboxgl.Map({
      container: 'map-bubble',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // lng, lat // TODO 41 - Pick a nice default
      zoom: 9
    })
      .on('load', () => {
        this.mapIsReady = true
        this.generateChart()
      })
  }

  @Watch('datasets') onDataChange (): void {
    this.generateChart()
  }

  getRadius (datum: ChartModels.MapSiteData): number {
    if (!this.taxon) return Math.sqrt(Object.values(datum.distinctSpecies).reduce((sum, val) => sum + val, 0))
    return Math.sqrt(datum.distinctSpecies[this.taxon])
  }

  generateChart (): void {
    if (!this.mapIsReady) return
    if (this.noData) {
      // TODO 41 - Clear the map
      return
    }
    const map = this.map

    this.datasets.forEach((dataset, idx) => {
      map.addSource(`species-richness-${idx}`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: dataset.data.map(datum => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [datum.longitude, datum.latitude]
            },
            properties: { title: datum.siteId, radius: this.getRadius(datum) }
          })
          )
        }
      })

      map.addLayer({
        id: `species-richness-${idx}`,
        type: 'circle',
        source: `species-richness-${idx}`,
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 4],
          'circle-color': '#B42222',
          'circle-opacity': 0.3
        }
      })
    })

    // TODO 41 - Merge this aggregation with the above loop
    const coordinates: Array<[number, number]> = this.datasets.flatMap(dataset => dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number]))
    const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    map.fitBounds(bounds, { padding: 20 })
  }
}
