import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'

const DEFAULT_SHADE = 10
type RgbColor = [number, number, number]

export interface HeatmapOption {
  heatmapRadius: number
}

const generateColorPaletteFromHex = (hexColor: string): RgbColor => {
  const rgbColor = hexColor
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i, (_, r: string, g: string, b: string, a: string) => `#${r}${r}${g}${g}${b}${b}${a}${a}`)
    ?.substring(1).match(/.{2}/g)
    ?.map(x => parseInt(x, 16))

  return rgbColor as RgbColor ?? [0, 0, 0]
}

// Read more about mapbox-gl `interpolate`: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate
export const heatmapStyleToPaint = ({ color }: MapBaseStyle, options: HeatmapOption = { heatmapRadius: 20 }): AnyPaint => {
  const rgbColors = generateColorPaletteFromHex(color)
  const rgbShade = (idx: number): string => `${Math.ceil(idx * rgbColors[0] / DEFAULT_SHADE)}, ${Math.ceil(idx * rgbColors[1] / DEFAULT_SHADE)}, ${Math.ceil(idx * rgbColors[2] / DEFAULT_SHADE)}`

  return ({
    // Increase the heatmap weight based on radius
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'radius'], // radius is value from data properties
      0, 1,
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
    // assign color values be applied to points depending on their density
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, `rgba(${rgbShade(5)}, 0)`,
      0.2, `rgb(${rgbShade(6)})`,
      0.4, `rgb(${rgbShade(7)})`,
      0.6, `rgb(${rgbShade(8)})`,
      0.8, `rgb(${rgbShade(9)})`,
      1, `rgb(${rgbShade(10)})`
    ],
    // Adjust the heatmap radius by zoom level
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 5,
      9, options.heatmapRadius
    ],
    // Transition from heatmap to circle layer by zoom level
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1
    ]
  })
}
