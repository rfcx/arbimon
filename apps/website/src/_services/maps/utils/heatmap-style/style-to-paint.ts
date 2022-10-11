import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'

export const heatmapStyleToPaint = ({ color, strokeColor, strokeWidth, opacity }: MapBaseStyle): AnyPaint =>
({
  'heatmap-weight': [
    'interpolate',
    ['linear'],
    ['get', 'radius'], // 'radius' is values related to dataset
    7, 1
  ],
  'heatmap-intensity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7, 1
  ],
  // assign color values be applied to points depending on their density
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(236,222,239,0)',
    0.2,
    'rgb(208,209,230)',
    0.4,
    'rgb(166,189,219)',
    0.6,
    'rgb(103,169,207)',
    0.8,
    'rgb(28,144,153)'
  ],
  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7, 1
  ],
  'heatmap-opacity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7, opacity
  ]
})
