import { mapValues } from 'lodash-es'

const featureTogglesRaw = {
  /* START: Declare toggles here */

  // Example:
  // showActivityLineChart: import.meta.env.VITE_TOGGLE_SHOW_ACTIVITY_LINE_CHART

  logoPride: import.meta.env.VITE_TOGGLE_LOGO_PRIDE,
  heatmapConfig: import.meta.env.VITE_TOGGLE_HEATMAP_CONFIG,
  explore: import.meta.env.VITE_TOGGLE_EXPLORE
  /* STOP: Declare toggles here */
}

// Setup types & export
export const FEATURE_TOGGLES = mapValues(featureTogglesRaw, value => value === 'true')
export type FeatureToggles = typeof FEATURE_TOGGLES
