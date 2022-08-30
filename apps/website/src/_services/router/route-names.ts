export const ROUTE_NAMES = {
  home: 'home',
  dashboard: 'dashboard',
  speciesRichness: 'species_richness',
  activityOverview: 'activity_overview',
  activityPatterns: 'activity_patterns',
  info: 'info',
  preferences: 'preferences',
  error: 'error',
  syncHistory: 'sync_history',
  cnnJobCreate: 'cnn_job_create',
  cnnJobList: 'cnn_job_list',
  cnnJobDetail: 'cnn_job_detail',
  cnnJobDetailBySpecies: 'cnn_job_detail_by_species'
} as const

export type RouteNames = typeof ROUTE_NAMES
