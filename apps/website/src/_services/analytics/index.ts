export const ANALYTICS_CONFIGS = {
  appName: import.meta.env.VITE_APP_NAME,
  pageTrackerScreenviewEnabled: true,
  config: {
    id: import.meta.env.VITE_GA_MEASUREMENT_ID
  },
  pageTrackerEnabled: true,
  // Temporarily disabled while investigating the visualizer-page hang
  // (rfcx/arbimon#2461). The bug reproduces even with GA's network calls
  // blocked at the renderer level, so GA is unlikely to be the trigger, but
  // we want a clean signal in production while bisecting the wedge. Setting
  // `enabled: false` short-circuits vue-gtag's bootstrap so neither
  // gtag/js?id=G-30S3SHR2JZ nor G-RJJTZ45WJB is loaded and no
  // googletagmanager / google-analytics scripts run. `import { event }` calls
  // from dashboard-markdown-viewer-editor become safe no-ops in this state
  // (vue-gtag@2.0.1 contract). Re-enable after #2461 is resolved.
  enabled: false,
  disableScriptLoad: true
}
