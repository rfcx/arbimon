export const ROUTE_NAMES = {
  // Landing
  landingHome: 'landing_home',
  landingFeatured: 'landing_featured',
  landingFeaturedDetail: 'landing_featured_detail',
  landingHowItWorks: 'landing_how_it_works',
  landingFAQ: 'landing_faq',
  landingTeam: 'landing_team',
  landingContact: 'landing_contact',
  landingPublications: 'landing_publications',
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
  // User
  userCompleteRegistration: 'user_complete_registration',
  userPreferences: 'user_preferences',
  // Other
  callback: 'callback',
  info: 'info',
  error: 'error'
} as const

export type RouteNames = typeof ROUTE_NAMES
