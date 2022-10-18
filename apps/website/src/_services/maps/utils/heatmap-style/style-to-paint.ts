import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle, StyleToPaint } from '~/maps/types'
import { COLOR_HEATMAP } from '~/store/colors'

export type HeatmapCustomByZoom = [number, number, number, number]

export interface HeatmapOption {
  heatmapWeight: HeatmapCustomByZoom
  heatmapIntensity: HeatmapCustomByZoom
  heatmapRadius: HeatmapCustomByZoom
}

// Read more about mapbox-gl `interpolate`: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate
export const heatmapStyleToPaint: StyleToPaint<AnyPaint, HeatmapOption> = (_: MapBaseStyle, options?: HeatmapOption): AnyPaint => ({
  // Increase the heatmap weight based on frequency and property magnitude
  'heatmap-weight': [
    'interpolate',
    ['linear'],
    ['get', 'radius'],
    ...(options?.heatmapWeight ?? [0, 0, 10, 2])
  ],
  // Increase the heatmap color weight weight by zoom level
  // heatmap-intensity is a multiplier on top of heatmap-weight
  'heatmap-intensity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    ...(options?.heatmapIntensity ?? [7, 0.1, 9, 1])
  ],
  // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
  // Begin color ramp at 0-stop with a 0-transparancy color
  // to create a blur-like effect.
  'heatmap-color': [
    'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(255,255,255,0)',
      0.2, COLOR_HEATMAP[0],
      0.4, COLOR_HEATMAP[1],
      0.6, COLOR_HEATMAP[2],
      0.8, COLOR_HEATMAP[3],
      1, COLOR_HEATMAP[4]
  ],
  // Adjust the heatmap radius by zoom level
  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    ...(options?.heatmapRadius ?? [0, 1, 10, 20])
  ]
})
