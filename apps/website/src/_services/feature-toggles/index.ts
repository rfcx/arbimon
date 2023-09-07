import { mapValues } from 'lodash-es'

const featureTogglesRaw = {
  /* START: Declare toggles here */

  // Example:
  // showActivityLineChart: import.meta.env.VITE_TOGGLE_SHOW_ACTIVITY_LINE_CHART
  heatmapConfig: import.meta.env.VITE_TOGGLE_HEATMAP_CONFIG,
  explore: import.meta.env.VITE_TOGGLE_EXPLORE,
  legacyLogin: import.meta.env.VITE_TOGGLE_LEGACY_LOGIN
  /* STOP: Declare toggles here */
}

// Setup types & export
export const FEATURE_TOGGLES = mapValues(featureTogglesRaw, value => value === 'true')
export type FeatureToggles = typeof FEATURE_TOGGLES
