import { CirclePaint } from 'mapbox-gl'

import { CircleStyle } from './types'

export const styleToPaint = ({ color, strokeColor, strokeWidth, opacity }: CircleStyle): CirclePaint =>
({
  'circle-color': color,
  'circle-stroke-color': strokeColor,
  'circle-stroke-width': strokeWidth,
  'circle-opacity': opacity
})
