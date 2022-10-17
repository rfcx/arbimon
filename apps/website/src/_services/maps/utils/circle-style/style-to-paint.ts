import { AnyPaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'

export const circleStyleToPaint = ({ color, strokeColor, strokeWidth, opacity }: MapBaseStyle): AnyPaint =>
({
  'circle-color': color,
  'circle-stroke-color': strokeColor,
  'circle-stroke-width': strokeWidth,
  'circle-opacity': opacity,
  'circle-radius': ['get', 'radius'] // radius is value from data properties
})
