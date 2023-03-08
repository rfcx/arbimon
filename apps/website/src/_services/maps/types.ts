import type { Dayjs } from 'dayjs'
import type { AnyPaint, LngLatLike } from 'mapbox-gl'

import type { Site } from '@rfcx-bio/common/dao/types'

export interface MapDataSet {
  startDate: Dayjs
  endDate: Dayjs
  sites: Site[]
  data: MapSiteData[]
  maxValues: Record<string, number>
  title?: string
}

export interface MapSiteData {
  siteName: string
  latitude: number
  longitude: number
  values: Record<string, number | boolean>
}

export interface MapMoveEvent {
  sourceMapId: string
  center: LngLatLike
  zoom: number
}

export interface MapBase {
  styleNonZero: AnyPaint
  styleZero: AnyPaint
  styleToPaint: () => unknown
  downloadMapPng: () => unknown
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
