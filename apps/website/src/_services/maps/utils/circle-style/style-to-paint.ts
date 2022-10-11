import { AnyPaint, CirclePaint } from 'mapbox-gl'

import { MapBaseStyle } from '~/maps/types'
import { CircleStyle } from './types'

/**
 * @deprecated use circleStyleToPaint instead
 */
export const styleToPaint = ({ color, strokeColor, strokeWidth, opacity }: CircleStyle): CirclePaint =>
({
  'circle-color': color,
  'circle-stroke-color': strokeColor,
  'circle-stroke-width': strokeWidth,
  'circle-opacity': opacity
})

export const circleStyleToPaint = ({ color, strokeColor, strokeWidth, opacity }: MapBaseStyle): AnyPaint =>
({
  'circle-color': color,
  'circle-stroke-color': strokeColor,
  'circle-stroke-width': strokeWidth,
  'circle-opacity': opacity,
  'circle-radius': ['get', 'radius'] // radius is value from data properties
})
