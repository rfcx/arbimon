export const FEATURE_TOGGLES = {
  toggleAoLine: import.meta.env.VITE_TOGGLE_AO_LINE === 'true'
}

export type FeatureToggles = typeof FEATURE_TOGGLES
