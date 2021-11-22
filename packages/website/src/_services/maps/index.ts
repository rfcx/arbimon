// This is the one place we import & configure mapbox
import { Map as MapboxMap, MapboxOptions } from 'mapbox-gl'

export * from './types'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicmZjeCIsImEiOiJoMEptMnlJIn0.LPKrjG_3AeYB5cqsyLpcrg'

export const MAPBOX_STYLE = 'mapbox://styles/rfcx/ckapdhmby26zo1io3nqd84dsd'
export const MAPBOX_STYLE_WITH_PLACE_LABELS = 'mapbox://styles/rfcx/ck9g6dci83g3x1io8dl27r7aq'

export const DEFAULT_LONGITUDE = -122.41818313563101
export const DEFAULT_LATITUDE = 37.750884708892286

export const createMap = (config: MapboxOptions): MapboxMap => new MapboxMap({ accessToken: MAPBOX_ACCESS_TOKEN, ...config })
