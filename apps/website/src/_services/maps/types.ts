import { Dayjs } from 'dayjs'
import { AnyPaint, LngLatLike } from 'mapbox-gl'

import { Site } from '@rfcx-bio/common/dao/types'

export interface MapDataSet {
  startDate: Dayjs
  endDate: Dayjs
  sites: Site[]
  data: MapSiteData[]
  maxValues: { [key: string]: number }
  title?: string
}

export interface MapSiteData {
  siteName: string
  latitude: number
  longitude: number
  values: {
    [key: string]: number | boolean
  }
}

export interface MapMoveEvent {
  sourceMapId: string
  center: LngLatLike
  zoom: number
}

export interface MapBase {
  styleNonZero: AnyPaint
  styleZero: AnyPaint
  styleToPaint: () => {}
  downloadMapPng: () => {}
}

export interface MapBaseStyle {
  color: string
  strokeColor: string
  strokeWidth: number
  opacity: number
}

export interface MapBaseLegendEntry {
  label: string
  radiusPx: number
  style: MapBaseStyle
}

export interface MapBaseFormatter {
  getRadius: (value: number) => number
  getLegendEntries: (styleNonZero: MapBaseStyle, styleZero: MapBaseStyle) => MapBaseLegendEntry[]
}

export type StyleToPaint<T = unknown, R = unknown> = (style: MapBaseStyle, options?: R) => T
