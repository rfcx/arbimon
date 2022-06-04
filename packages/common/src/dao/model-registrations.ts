import { CacheUserProjectModel, DashboardDetectionByHourModel, DashboardDetectionBySiteModel, DashboardRichnessByHourModel, DashboardRichnessByRiskModel, DashboardRichnessBySiteModel, DashboardRichnessByTaxonModel, DashboardSpeciesHighlightedModel, DashboardSpeciesThreatenedModel, DetectionBySourceSiteSpeciesHourModel, DetectionByVersionSiteSpeciesHourModel, MODEL_CACHE_USER_PROJECT, MODEL_DASHBOARD_DETECTION_BY_HOUR, MODEL_DASHBOARD_DETECTION_BY_SITE, MODEL_DASHBOARD_RICHNESS_BY_HOUR, MODEL_DASHBOARD_RICHNESS_BY_RISK, MODEL_DASHBOARD_RICHNESS_BY_SITE, MODEL_DASHBOARD_RICHNESS_BY_TAXON, MODEL_DASHBOARD_SPECIES_HIGHLIGHTED, MODEL_DASHBOARD_SPECIES_THREATENED, MODEL_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR, MODEL_DETECTION_BY_VERSION_SITE_SPECIES_HOUR, MODEL_PROJECT, MODEL_PROJECT_METRIC, MODEL_PROJECT_PROFILE, MODEL_PROJECT_PROFILE_HIGHLIGHTED_SPECIES, MODEL_PROJECT_SITE, MODEL_PROJECT_VERSION, MODEL_RECORDING_BY_SOURCE_SITE_HOUR, MODEL_RECORDING_BY_VERSION_SITE_HOUR, MODEL_RISK_RATING, MODEL_SOURCE, MODEL_SPECIES_IN_PROJECT, MODEL_SYNC_DATA_TYPE, MODEL_SYNC_LOG_BY_PROJECT, MODEL_SYNC_STATUS, MODEL_TAXON_CLASS, MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_AUDIO, MODEL_TAXON_SPECIES_COMMON_NAME, MODEL_TAXON_SPECIES_DESCRIPTION, MODEL_TAXON_SPECIES_FILE, MODEL_TAXON_SPECIES_PHOTO, MODEL_TAXON_SPECIES_PROJECT_DESCRIPTION, MODEL_TAXON_SPECIES_PROJECT_FILE, MODEL_TAXON_SPECIES_PROJECT_RISK_RATING, MODEL_TAXON_SPECIES_RISK_RATING, MODEL_TAXON_SPECIES_SOURCE, ProjectMetricModel, ProjectModel, ProjectProfileHighlightedSpeciesModel, ProjectProfileModel, ProjectSiteModel, ProjectVersionModel, RecordingBySourceSiteHourModel, RecordingByVersionSiteHourModel, RiskRatingModel, SourceModel, SpeciesInProjectModel, SyncDataTypeModel, SyncErrorModel, SyncLogByProjectModel, SyncStatusModel, TaxonClassModel, TaxonSpeciesAudioModel, TaxonSpeciesCommonNameModel, TaxonSpeciesDescriptionModel, TaxonSpeciesFileModel, TaxonSpeciesModel, TaxonSpeciesPhotoModel, TaxonSpeciesProjectDescriptionModel, TaxonSpeciesProjectFileModel, TaxonSpeciesProjectRiskRatingModel, TaxonSpeciesRiskRatingModel, TaxonSpeciesSourceModel } from './models'
import { MODEL_SYNC_ERROR } from './models/tables/sync-error-model'

export const modelRegistrations = {
  // Tables
  [MODEL_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR]: [DetectionBySourceSiteSpeciesHourModel, { manyToOne: [MODEL_SOURCE, MODEL_PROJECT_SITE, MODEL_TAXON_SPECIES, MODEL_PROJECT] }],
  [MODEL_DETECTION_BY_VERSION_SITE_SPECIES_HOUR]: [DetectionByVersionSiteSpeciesHourModel, { manyToOne: [MODEL_PROJECT_VERSION, MODEL_PROJECT_SITE, MODEL_TAXON_SPECIES, MODEL_PROJECT, MODEL_TAXON_CLASS] }],

  [MODEL_PROJECT]: [ProjectModel],
  [MODEL_PROJECT_PROFILE_HIGHLIGHTED_SPECIES]: [ProjectProfileHighlightedSpeciesModel, { manyToOne: [MODEL_PROJECT, MODEL_TAXON_SPECIES] }],
  [MODEL_PROJECT_PROFILE]: [ProjectProfileModel, { oneToOne: [MODEL_PROJECT] }],
  [MODEL_PROJECT_SITE]: [ProjectSiteModel, { manyToOne: [MODEL_PROJECT, { model: MODEL_PROJECT_VERSION, foreignKey: 'project_version_first_appears_id' }] }],
  [MODEL_PROJECT_VERSION]: [ProjectVersionModel, { manyToOne: [MODEL_PROJECT] }],

  [MODEL_RECORDING_BY_SOURCE_SITE_HOUR]: [RecordingBySourceSiteHourModel, { manyToOne: [MODEL_SOURCE, MODEL_PROJECT_SITE, MODEL_PROJECT] }],
  [MODEL_RECORDING_BY_VERSION_SITE_HOUR]: [RecordingByVersionSiteHourModel, { manyToOne: [MODEL_PROJECT_VERSION, MODEL_PROJECT_SITE, MODEL_PROJECT] }],

  [MODEL_RISK_RATING]: [RiskRatingModel],

  [MODEL_SOURCE]: [SourceModel],

  [MODEL_SYNC_DATA_TYPE]: [SyncDataTypeModel],
  [MODEL_SYNC_ERROR]: [SyncErrorModel, { manyToOne: [MODEL_SOURCE, MODEL_SYNC_DATA_TYPE] }],
  [MODEL_SYNC_LOG_BY_PROJECT]: [SyncLogByProjectModel, { manyToOne: [MODEL_PROJECT, MODEL_SOURCE, MODEL_SYNC_DATA_TYPE] }],
  [MODEL_SYNC_STATUS]: [SyncStatusModel, { manyToOne: [MODEL_SOURCE, MODEL_SYNC_DATA_TYPE] }],

  [MODEL_TAXON_CLASS]: [TaxonClassModel],

  [MODEL_TAXON_SPECIES]: [TaxonSpeciesModel, { manyToOne: [MODEL_TAXON_CLASS] }],
  [MODEL_TAXON_SPECIES_AUDIO]: [TaxonSpeciesAudioModel, { manyToOne: [MODEL_TAXON_SPECIES, { model: MODEL_PROJECT, foreignKey: 'recordingProjectId' }, { model: MODEL_PROJECT_SITE, foreignKey: 'recordingSiteId' }] }],
  [MODEL_TAXON_SPECIES_COMMON_NAME]: [TaxonSpeciesCommonNameModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_SOURCE] }],
  [MODEL_TAXON_SPECIES_DESCRIPTION]: [TaxonSpeciesDescriptionModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_SOURCE] }],
  [MODEL_TAXON_SPECIES_FILE]: [TaxonSpeciesFileModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_SOURCE] }],
  [MODEL_TAXON_SPECIES_PHOTO]: [TaxonSpeciesPhotoModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_SOURCE] }],
  [MODEL_TAXON_SPECIES_PROJECT_DESCRIPTION]: [TaxonSpeciesProjectDescriptionModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_PROJECT] }],
  [MODEL_TAXON_SPECIES_PROJECT_FILE]: [TaxonSpeciesProjectFileModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_PROJECT] }],
  [MODEL_TAXON_SPECIES_PROJECT_RISK_RATING]: [TaxonSpeciesProjectRiskRatingModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_PROJECT, MODEL_RISK_RATING] }],
  [MODEL_TAXON_SPECIES_RISK_RATING]: [TaxonSpeciesRiskRatingModel, { manyToOne: [MODEL_TAXON_SPECIES, MODEL_TAXON_SPECIES_SOURCE, MODEL_RISK_RATING] }],
  [MODEL_TAXON_SPECIES_SOURCE]: [TaxonSpeciesSourceModel],

  // Views
  [MODEL_DASHBOARD_DETECTION_BY_HOUR]: [DashboardDetectionByHourModel],
  [MODEL_DASHBOARD_DETECTION_BY_SITE]: [DashboardDetectionBySiteModel],
  [MODEL_DASHBOARD_RICHNESS_BY_HOUR]: [DashboardRichnessByHourModel],
  [MODEL_DASHBOARD_RICHNESS_BY_RISK]: [DashboardRichnessByRiskModel],
  [MODEL_DASHBOARD_RICHNESS_BY_SITE]: [DashboardRichnessBySiteModel],
  [MODEL_DASHBOARD_RICHNESS_BY_TAXON]: [DashboardRichnessByTaxonModel],
  [MODEL_DASHBOARD_SPECIES_HIGHLIGHTED]: [DashboardSpeciesHighlightedModel],
  [MODEL_DASHBOARD_SPECIES_THREATENED]: [DashboardSpeciesThreatenedModel],
  [MODEL_PROJECT_METRIC]: [ProjectMetricModel],
  [MODEL_SPECIES_IN_PROJECT]: [SpeciesInProjectModel],

  // Caches
  // TODO - Delete these & use redis
  [MODEL_CACHE_USER_PROJECT]: [CacheUserProjectModel]
} as const

export type ModelRegistrations = typeof modelRegistrations
