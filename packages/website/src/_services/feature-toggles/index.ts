import { mapValues } from 'lodash-es'

const featureTogglesRaw = {
  /* START: Declare toggles here */

  // Example:
  // toggleAoLine: import.meta.env.VITE_TOGGLE_AO_LINE

  /* STOP: Declare toggles here */
}

// Setup types & export
type FeatureTogglesRaw = typeof featureTogglesRaw
export type FeatureToggles = { [K in keyof FeatureTogglesRaw]: boolean}
export const featureToggles: FeatureToggles = mapValues(featureTogglesRaw, value => value as boolean)
