export const ROUTE_NAMES = {
  // Landing
  landingHome: 'landing_home',
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
  projectSettings: 'project_settings',
  projectMember: 'project_member',
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
  userCompleteProfile: 'user_complete_profile',
  userPreferences: 'user_preferences',
  accountSettings: 'account_settings',
  // Other
  super: 'super',
  superProject: 'super_project',
  superMember: 'super_member',
  superSyncHistory: 'super_sync_history',
  callback: 'callback',
  info: 'info',
  error: 'error',
  login: 'login',
  signup: 'signup',
  // Uploader Recordings
  importRecordings: 'import_recordings',
  // audiodata
  mySites: 'my-sites',
  myRecordings: 'my-recordings',
  mySpecies: 'my-species'
} as const

export type RouteNames = typeof ROUTE_NAMES
