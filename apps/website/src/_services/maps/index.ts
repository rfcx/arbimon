// This is the one place we import & configure mapbox
import { Map as MapboxMap, MapboxOptions } from 'mapbox-gl'

// Mapbox Auth
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicmZjeCIsImEiOiJoMEptMnlJIn0.LPKrjG_3AeYB5cqsyLpcrg'
export const createMap = (config: MapboxOptions): MapboxMap => new MapboxMap({ accessToken: MAPBOX_ACCESS_TOKEN, ...config })

// Defaults
export const DEFAULT_LONGITUDE = -122.41818313563101
export const DEFAULT_LATITUDE = 37.750884708892286
export const DEFAULT_MAP_HEIGHT = 576

// Ground Styles
export const MAPBOX_STYLE_SATELLITE_STREETS = 'mapbox://styles/mapbox/satellite-streets-v11'
export const MAPBOX_STYLE_RFCX = 'mapbox://styles/rfcx/ckapdhmby26zo1io3nqd84dsd'
export const MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS = 'mapbox://styles/rfcx/ck9g6dci83g3x1io8dl27r7aq'

// Statistics Styles
export const MAPBOX_STYLE_HEATMAP = 'heatmap'
export const MAPBOX_STYLE_BUBBLE = 'bubble'

const ALL_MAPBOX_STYLES = [MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_RFCX, MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_BUBBLE] as const
export type MapboxStyle = typeof ALL_MAPBOX_STYLES[number]
