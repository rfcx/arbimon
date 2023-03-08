import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import { type CircleStyle } from './types'

export const nonZeroStyleWithColor = (color: string): CircleStyle =>
  ({ ...DEFAULT_NON_ZERO_STYLE, color })

export const zeroStyleWithColor = (color: string): CircleStyle =>
  ({ ...DEFAULT_ZERO_STYLE, color })
