import { mapValues } from 'lodash-es'

const featureTogglesRaw = {
  /* START: Declare toggles here */

  // Example:
  // aoLine: import.meta.env.VITE_TOGGLE_AO_LINE

  logoPride: import.meta.env.VITE_TOGGLE_LOGO_PRIDE

  /* STOP: Declare toggles here */
}

// Setup types & export
export const FEATURE_TOGGLES = mapValues(featureTogglesRaw, value => value === 'true')
export type FeatureToggles = typeof FEATURE_TOGGLES
