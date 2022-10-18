import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'
import { COLOR_HEATMAP } from '~/store/colors'

export interface HeatmapOption {
  heatmapRadius: number
}

// Read more about mapbox-gl `interpolate`: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate
export const heatmapStyleToPaint = (_: MapBaseStyle): AnyPaint => ({
  // Increase the heatmap weight based on frequency and property magnitude
  'heatmap-weight': [
    'interpolate',
    ['linear'],
    ['get', 'radius'],
    0, 0,
    7, 1
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
    0, 1,
    10, 20
  ]
})
