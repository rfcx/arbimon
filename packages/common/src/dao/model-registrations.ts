import { BackupModel, MODEL_BACKUP } from './models/backup-model'
import { DashboardDetectionByHourModel, MODEL_DASHBOARD_DETECTION_BY_HOUR } from './models/dashboard-detection-by-hour-model'
import { DashboardRichnessByHourModel, MODEL_DASHBOARD_RICHNESS_BY_HOUR } from './models/dashboard-richness-by-hour-model'
import { DashboardRichnessByRiskModel, MODEL_DASHBOARD_RICHNESS_BY_RISK } from './models/dashboard-richness-by-risk-model'
import { DashboardRichnessBySiteModel, MODEL_DASHBOARD_RICHNESS_BY_SITE } from './models/dashboard-richness-by-site-model'
import { DashboardRichnessByTaxonModel, MODEL_DASHBOARD_RICHNESS_BY_TAXON } from './models/dashboard-richness-by-taxon-model'
import { DashboardSpeciesHighlightedModel, MODEL_DASHBOARD_SPECIES_HIGHLIGHTED } from './models/dashboard-species-highlighted-model'
import { DashboardSpeciesThreatenedModel, MODEL_DASHBOARD_SPECIES_THREATENED } from './models/dashboard-species-threatened-model'
import { DataSourceModel, MODEL_DATA_SOURCE } from './models/data-source-model'
import { DetectionBySiteSpeciesHourModel, MODEL_DETECTION_BY_SITE_SPECIES_HOUR } from './models/detection-by-site-species-hour-model'
import { LocationProjectCountryModel, MODEL_LOCATION_PROJECT_COUNTRY } from './models/location-project-country-model'
import { LocationProjectMetricModel, MODEL_LOCATION_PROJECT_METRIC } from './models/location-project-metric-model'
import { LocationProjectModel, MODEL_LOCATION_PROJECT } from './models/location-project-model'
import { LocationProjectOrganizationModel, MODEL_LOCATION_PROJECT_ORGANIZATION } from './models/location-project-organization-model'
import { LocationProjectProfileModel, MODEL_LOCATION_PROJECT_PROFILE } from './models/location-project-profile-model'
import { LocationProjectSpeciesModel, MODEL_LOCATION_PROJECT_SPECIES } from './models/location-project-species-model'
import { LocationProjectUserRoleModel, MODEL_LOCATION_PROJECT_USER_ROLE } from './models/location-project-user-role-model'
import { LocationSiteModel, MODEL_LOCATION_SITE } from './models/location-site-model'
import { MODEL_ORGANIZATION, OrganizationModel } from './models/organization-model'
import { MODEL_RECORDING_BY_SITE_HOUR, RecordingBySiteHourModel } from './models/recording-by-site-hour-model'
import { MODEL_RISK_RATING_IUCN, RiskRatingIucnModel } from './models/risk-rating-iucn-model'
import { MODEL_SPECIES_IN_PROJECT, SpeciesInProjectModel } from './models/species-in-project-model'
import { MODEL_SYNC_DATA_TYPE, SyncDataTypeModel } from './models/sync-data-type-model'
import { MODEL_SYNC_ERROR, SyncErrorModel } from './models/sync-error-model'
import { MODEL_SYNC_LOG_BY_PROJECT, SyncLogByProjectModel } from './models/sync-log-by-project-model'
import { MODEL_SYNC_SOURCE, SyncSourceModel } from './models/sync-source-model'
import { MODEL_SYNC_STATUS, SyncStatusModel } from './models/sync-status-model'
import { MODEL_TAXON_CLASS, TaxonClassModel } from './models/taxon-class-model'
import { MODEL_TAXON_SPECIES_CALL, TaxonSpeciesCallModel } from './models/taxon-species-call-model'
import { MODEL_TAXON_SPECIES_IUCN, TaxonSpeciesIucnModel } from './models/taxon-species-iucn-model'
import { MODEL_TAXON_SPECIES, TaxonSpeciesModel } from './models/taxon-species-model'
import { MODEL_TAXON_SPECIES_PHOTO, TaxonSpeciesPhotoModel } from './models/taxon-species-photo-model'
import { MODEL_TAXON_SPECIES_RFCX, TaxonSpeciesRfcxModel } from './models/taxon-species-rfcx-model'
import { MODEL_TAXON_SPECIES_WIKI, TaxonSpeciesWikiModel } from './models/taxon-species-wiki-model'
import { MODEL_USER_PROFILE, UserProfileModel } from './models/user-profile-model'

export const modelRegistrations = {
  // Tables
  [MODEL_DATA_SOURCE]: [DataSourceModel, { manyToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_DETECTION_BY_SITE_SPECIES_HOUR]: [DetectionBySiteSpeciesHourModel, { manyToOne: [MODEL_LOCATION_SITE, MODEL_TAXON_SPECIES] }],
  [MODEL_LOCATION_PROJECT]: [LocationProjectModel, { manyToMany: [{ model: MODEL_ORGANIZATION, through: MODEL_LOCATION_PROJECT_ORGANIZATION, foreignKey: undefined }, { model: MODEL_USER_PROFILE, through: MODEL_LOCATION_PROJECT_USER_ROLE, foreignKey: 'user_id' }] }],
  [MODEL_LOCATION_PROJECT_ORGANIZATION]: [LocationProjectOrganizationModel, {}],
  [MODEL_LOCATION_PROJECT_PROFILE]: [LocationProjectProfileModel, { oneToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_LOCATION_PROJECT_SPECIES]: [LocationProjectSpeciesModel, { manyToOne: [MODEL_LOCATION_PROJECT, MODEL_TAXON_SPECIES] }],
  [MODEL_LOCATION_PROJECT_USER_ROLE]: [LocationProjectUserRoleModel, {}],
  [MODEL_LOCATION_SITE]: [LocationSiteModel, { manyToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_ORGANIZATION]: [OrganizationModel, { manyToMany: [{ model: MODEL_LOCATION_PROJECT, through: MODEL_LOCATION_PROJECT_ORGANIZATION, foreignKey: undefined }] }],
  [MODEL_RECORDING_BY_SITE_HOUR]: [RecordingBySiteHourModel, { manyToOne: [MODEL_LOCATION_SITE] }],
  [MODEL_RISK_RATING_IUCN]: [RiskRatingIucnModel, {}],
  [MODEL_TAXON_CLASS]: [TaxonClassModel, {}],
  [MODEL_TAXON_SPECIES]: [TaxonSpeciesModel, { manyToOne: [MODEL_TAXON_CLASS] }],
  [MODEL_TAXON_SPECIES_CALL]: [TaxonSpeciesCallModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_IUCN]: [TaxonSpeciesIucnModel, { oneToOne: [MODEL_TAXON_SPECIES], manyToOne: [MODEL_RISK_RATING_IUCN] }],
  [MODEL_TAXON_SPECIES_PHOTO]: [TaxonSpeciesPhotoModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_RFCX]: [TaxonSpeciesRfcxModel, { oneToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_WIKI]: [TaxonSpeciesWikiModel, { oneToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_SYNC_SOURCE]: [SyncSourceModel],
  [MODEL_SYNC_DATA_TYPE]: [SyncDataTypeModel],
  [MODEL_SYNC_ERROR]: [SyncErrorModel, { manyToOne: [MODEL_SYNC_SOURCE, MODEL_SYNC_DATA_TYPE] }],
  [MODEL_SYNC_LOG_BY_PROJECT]: [SyncLogByProjectModel, { manyToOne: [MODEL_LOCATION_PROJECT, MODEL_SYNC_SOURCE, MODEL_SYNC_DATA_TYPE] }],
  [MODEL_SYNC_STATUS]: [SyncStatusModel, { manyToOne: [MODEL_SYNC_SOURCE, MODEL_SYNC_DATA_TYPE] }],
  [MODEL_USER_PROFILE]: [UserProfileModel, { manyToMany: [{ model: MODEL_LOCATION_PROJECT, through: MODEL_LOCATION_PROJECT_USER_ROLE, foreignKey: 'location_project_id' }] }],
  [MODEL_BACKUP]: [BackupModel],

  // Views
  [MODEL_DASHBOARD_DETECTION_BY_HOUR]: [DashboardDetectionByHourModel],
  [MODEL_DASHBOARD_RICHNESS_BY_HOUR]: [DashboardRichnessByHourModel],
  [MODEL_DASHBOARD_RICHNESS_BY_SITE]: [DashboardRichnessBySiteModel],
  [MODEL_DASHBOARD_RICHNESS_BY_RISK]: [DashboardRichnessByRiskModel],
  [MODEL_DASHBOARD_RICHNESS_BY_TAXON]: [DashboardRichnessByTaxonModel],
  [MODEL_DASHBOARD_SPECIES_HIGHLIGHTED]: [DashboardSpeciesHighlightedModel],
  [MODEL_DASHBOARD_SPECIES_THREATENED]: [DashboardSpeciesThreatenedModel],
  [MODEL_LOCATION_PROJECT_METRIC]: [LocationProjectMetricModel, { oneToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_LOCATION_PROJECT_COUNTRY]: [LocationProjectCountryModel, { oneToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_SPECIES_IN_PROJECT]: [SpeciesInProjectModel]
} as const

export type ModelRegistrations = typeof modelRegistrations
