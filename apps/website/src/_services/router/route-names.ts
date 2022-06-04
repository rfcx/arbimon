export const ROUTE_NAMES = {
  cnnJobCreate: 'cnn_job_create',
  cnnJobList: 'cnn_job_list',
  home: 'home',
  dashboard: 'dashboard',
  speciesRichness: 'species_richness',
  activityOverview: 'activity_overview',
  activityPatterns: 'activity_patterns',
  info: 'info',
  preferences: 'preferences',
  error: 'error',
  syncHistory: 'sync_history'
} as const

export type RouteNames = typeof ROUTE_NAMES
