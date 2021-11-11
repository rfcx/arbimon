import { LngLatLike } from 'mapbox-gl'

export interface MapConfig {
  sourceMapId: string
  center: LngLatLike
  zoom: number
}
