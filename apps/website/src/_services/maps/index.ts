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
export const MAPBOX_STYLE_BUBBLE = 'circle'

// Layer IDs
export const LABEL_LAYER_IDS = ['tunnel-primary-secondary-tertiary-case', 'tunnel-major-link-case', 'tunnel-motorway-trunk-case', 'tunnel-path', 'tunnel-steps', 'tunnel-major-link', 'tunnel-pedestrian', 'tunnel-primary-secondary-tertiary', 'tunnel-oneway-arrow-blue', 'tunnel-motorway-trunk', 'tunnel-oneway-arrow-white', 'ferry', 'ferry-auto', 'road-pedestrian-case', 'road-street-low', 'road-street-case', 'road-secondary-tertiary-case', 'road-primary-case', 'road-major-link-case', 'road-motorway-trunk-case', 'road-path', 'road-steps', 'road-major-link', 'road-pedestrian', 'road-street', 'road-secondary-tertiary', 'road-primary', 'road-oneway-arrow-blue', 'road-motorway-trunk', 'road-oneway-arrow-white', 'bridge-pedestrian-case', 'bridge-primary-secondary-tertiary-case', 'bridge-major-link-case', 'bridge-motorway-trunk-case', 'bridge-path', 'bridge-steps', 'bridge-major-link', 'bridge-pedestrian', 'bridge-primary-secondary-tertiary', 'bridge-oneway-arrow-blue', 'bridge-motorway-trunk', 'bridge-major-link-2-case', 'bridge-motorway-trunk-2-case', 'bridge-major-link-2', 'bridge-motorway-trunk-2', 'bridge-oneway-arrow-white', 'aerialway', 'admin-1-boundary-bg', 'admin-0-boundary-bg', 'admin-1-boundary', 'admin-0-boundary', 'admin-0-boundary-disputed', 'road-label', 'road-number-shield', 'road-exit-shield', 'waterway-label', 'natural-line-label', 'natural-point-label', 'water-line-label', 'water-point-label', 'poi-label', 'transit-label', 'airport-label', 'settlement-subdivision-label', 'settlement-label', 'state-label', 'country-label', 'settlement-minor-label', 'settlement-major-label']

const ALL_MAPBOX_GROUND_STYLES = [MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_RFCX, MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS] as const
const ALL_MAPBOX_STATISTICS_STYLES = [MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_BUBBLE] as const
const ALL_MAPBOX_STYLES = [...ALL_MAPBOX_GROUND_STYLES, ...ALL_MAPBOX_STATISTICS_STYLES] as const

export type MapboxGroundStyle = typeof ALL_MAPBOX_GROUND_STYLES[number]
export type MapboxStatisticsStyle = typeof ALL_MAPBOX_STATISTICS_STYLES[number]
export type MapboxStyle = typeof ALL_MAPBOX_STYLES[number]
