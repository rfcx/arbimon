import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'

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
    6, 1
  ],
  // Increase the heatmap color weight weight by zoom level
  // heatmap-intensity is a multiplier on top of heatmap-weight
  'heatmap-intensity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    0, 1,
    9, 3
  ],
  // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
  // Begin color ramp at 0-stop with a 0-transparancy color
  // to create a blur-like effect.
  'heatmap-color': [
  'interpolate',
    ['linear'],
    ['heatmap-density'],
    0, 'rgba(33,102,172,0)',
    0.2, 'rgb(103,169,207)',
    0.4, 'rgb(209,229,240)',
    0.6, 'rgb(253,219,199)',
    0.8, 'rgb(239,138,98)',
    1, 'rgb(178,24,43)'
  ],
  // Adjust the heatmap radius by zoom level
  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    0, 2,
    9, 20
  ],
  // Transition from heatmap to circle layer by zoom level
  'heatmap-opacity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7, 1,
    9, 0.5
  ]
})
// export const heatmapStyleToPaint = ({ color }: MapBaseStyle, options: HeatmapOption = { heatmapRadius: 20 }): AnyPaint => {
//   const rgbColors = hexToRgb(color)
//   const rgbShade = (idx: number): string => `${Math.ceil(idx * rgbColors[0] / DEFAULT_SHADE)}, ${Math.ceil(idx * rgbColors[1] / DEFAULT_SHADE)}, ${Math.ceil(idx * rgbColors[2] / DEFAULT_SHADE)}`

//   return ({
//     // Increase the heatmap weight based on radius
//     'heatmap-weight': [
//       'interpolate',
//       ['linear'],
//       ['get', 'radius'], // radius is value from data properties
//       0, 1,
//       6, 1
//     ],
//     // Increase the heatmap color weight weight by zoom level
//     // heatmap-intensity is a multiplier on top of heatmap-weight
//     'heatmap-intensity': [
//       'interpolate',
//       ['linear'],
//       ['zoom'],
//       0, 1,
//       9, 3
//     ],
//     // assign color values be applied to points depending on their density
//     'heatmap-color': [
//       'interpolate',
//       ['linear'],
//       ['heatmap-density'],
//       0, `rgba(${rgbShade(5)}, 0)`,
//       0.2, `rgb(${rgbShade(6)})`,
//       0.4, `rgb(${rgbShade(7)})`,
//       0.6, `rgb(${rgbShade(8)})`,
//       0.8, `rgb(${rgbShade(9)})`,
//       1, `rgb(${rgbShade(10)})`
//     ],
//     // Adjust the heatmap radius by zoom level
//     'heatmap-radius': [
//       'interpolate',
//       ['linear'],
//       ['zoom'],
//       0, 5,
//       9, options.heatmapRadius
//     ],
//     // Transition from heatmap to circle layer by zoom level
//     'heatmap-opacity': [
//       'interpolate',
//       ['linear'],
//       ['zoom'],
//       0, 1
//     ]
//   })
// }
