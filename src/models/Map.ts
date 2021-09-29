import mapboxgl from 'mapbox-gl'

export interface MapConfig {
  sourceMapId: string
  center: mapboxgl.LngLatLike
  zoom: number
}
