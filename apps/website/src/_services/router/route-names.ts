export const ROUTE_NAMES = {
  // Landing
  landingHome: 'landing_home',
  landingFeatured: 'landing_featured',
  landingFeaturedReforestation: 'landing_featured_reforestation',
  landingFeaturedEndangeredSpecies: 'landing_featured_endangered_species',
  landingHowItWorks: 'landing_how_it_works',
  landingFAQ: 'landing_faq',
  landingTeam: 'landing_team',
  landingContact: 'landing_contact',
  // Projects
  createProject: 'create_project',
  explore: 'explore',
  myProjects: 'my_projects',
  dashboard: 'dashboard',
  // Project - Insights
  overview: 'overview',
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
  callback: 'callback',
  info: 'info',
  preferences: 'preferences',
  error: 'error'
} as const

export type RouteNames = typeof ROUTE_NAMES
