export const ANALYTICS_CONFIGS = {
  appName: import.meta.env.VITE_APP_NAME,
  pageTrackerScreenviewEnabled: true,
  config: {
    id: import.meta.env.VITE_GA_MEASUREMENT_ID
  },
  pageTrackerEnabled: true
}
