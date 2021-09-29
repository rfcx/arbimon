import mapboxgl from 'mapbox-gl'

export interface MapConfig {
  mapId: string
  center: mapboxgl.LngLatLike
  zoom: number
}
