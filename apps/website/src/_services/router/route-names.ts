export const ROUTE_NAMES = {
  // Landing
  landingHome: 'landing_home',
  landingFeatured: 'landing_featured',
  landingFeaturedDetail: 'landing_featured_detail',
  landingHowItWorks: 'landing_how_it_works',
  landingFAQ: 'landing_faq',
  landingContact: 'landing_contact',
  // Projects
  explore: 'explore',
  myProjects: 'my_projects',
  overview: 'overview',
  // Project - Insights
  speciesRichness: 'species_richness',
  activityOverview: 'activity_overview',
  activityPatterns: 'activity_patterns',
  syncHistory: 'sync_history',
  // Project - Import
  import: 'import',
  // Project - Acoustic Analyses
  cnnJobCreate: 'cnn_job_create',
  cnnJobList: 'cnn_job_list',
  cnnJobDetail: 'cnn_job_detail',
  cnnJobDetailBySpecies: 'cnn_job_detail_by_species',
  // Other
  info: 'info',
  preferences: 'preferences',
  error: 'error'
} as const

export type RouteNames = typeof ROUTE_NAMES
