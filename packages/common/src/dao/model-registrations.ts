import { CacheUserProjectModel, MODEL_CACHE_USER_PROJECT } from './models-cache/cache-user-project-model'
import { DataSourceModel, MODEL_DATA_SOURCE } from './models-table/data-source-model'
import { DetectionBySiteSpeciesHourModel, MODEL_DETECTION_BY_SITE_SPECIES_HOUR } from './models-table/detection-by-site-species-hour-model'
import { MODEL_PROJECT, ProjectModel } from './models-table/project-model'
import { MODEL_PROJECT_PROFILE, ProjectProfileModel } from './models-table/project-profile-model'
import { MODEL_PROJECT_SITE, ProjectSiteModel } from './models-table/project-site-model'
import { MODEL_PROJECT_VERSION, ProjectVersionModel } from './models-table/project-version-model'
import { MODEL_RISK_RATING, RiskRatingModel } from './models-table/risk-rating-model'
import { MODEL_TAXON_CLASS, TaxonClassModel } from './models-table/taxon-class-model'
import { MODEL_TAXON_SPECIES_CALL, TaxonSpeciesCallModel } from './models-table/taxon-species-call-model'
import { MODEL_TAXON_SPECIES_IUCN, TaxonSpeciesIucnModel } from './models-table/taxon-species-iucn-model'
import { MODEL_TAXON_SPECIES, TaxonSpeciesModel } from './models-table/taxon-species-model'
import { MODEL_TAXON_SPECIES_PHOTO, TaxonSpeciesPhotoModel } from './models-table/taxon-species-photo-model'
import { MODEL_TAXON_SPECIES_PROJECT_FILE, TaxonSpeciesProjectFileModel } from './models-table/taxon-species-project-file-model'
import { MODEL_TAXON_SPECIES_PROJECT, TaxonSpeciesProjectModel } from './models-table/taxon-species-project-model'
import { MODEL_TAXON_SPECIES_RFCX, TaxonSpeciesRfcxModel } from './models-table/taxon-species-rfcx-model'
import { MODEL_TAXON_SPECIES_WIKI, TaxonSpeciesWikiModel } from './models-table/taxon-species-wiki-model'
import { DashboardDetectionByHourModel, MODEL_DASHBOARD_DETECTION_BY_HOUR } from './models-view/dashboard-detection-by-hour-model'
import { DashboardDetectionBySiteModel, MODEL_DASHBOARD_DETECTION_BY_SITE } from './models-view/dashboard-detection-by-site-model'
import { DashboardRichnessByHourModel, MODEL_DASHBOARD_RICHNESS_BY_HOUR } from './models-view/dashboard-richness-by-hour-model'
import { DashboardRichnessByRiskModel, MODEL_DASHBOARD_RICHNESS_BY_RISK } from './models-view/dashboard-richness-by-risk-model'
import { DashboardRichnessBySiteModel, MODEL_DASHBOARD_RICHNESS_BY_SITE } from './models-view/dashboard-richness-by-site-model'
import { DashboardRichnessByTaxonModel, MODEL_DASHBOARD_RICHNESS_BY_TAXON } from './models-view/dashboard-richness-by-taxon-model'
import { DashboardSpeciesHighlightedModel, MODEL_DASHBOARD_SPECIES_HIGHLIGHTED } from './models-view/dashboard-species-highlighted-model'
import { DashboardSpeciesThreatenedModel, MODEL_DASHBOARD_SPECIES_THREATENED } from './models-view/dashboard-species-threatened-model'
import { DetectionBySiteHourModel, MODEL_DETECTION_BY_SITE_HOUR } from './models-view/detection-by-site-hour-model'
import { MODEL_PROJECT_METRIC, ProjectMetricModel } from './models-view/project-metric-model'
import { MODEL_SPECIES_IN_PROJECT, SpeciesInProjectModel } from './models-view/species-in-project-model'

export const modelRegistrations = <const>{
  // Tables
  [MODEL_DATA_SOURCE]: [DataSourceModel, { manyToOne: [MODEL_PROJECT] }],
  [MODEL_DETECTION_BY_SITE_SPECIES_HOUR]: [DetectionBySiteSpeciesHourModel, { manyToOne: [MODEL_PROJECT_SITE, MODEL_TAXON_SPECIES] }],
  [MODEL_PROJECT]: [ProjectModel, {}],
  [MODEL_PROJECT_PROFILE]: [ProjectProfileModel, { oneToOne: [MODEL_PROJECT] }],
  [MODEL_PROJECT_SITE]: [ProjectSiteModel, { manyToOne: [MODEL_PROJECT] }],
  [MODEL_PROJECT_VERSION]: [ProjectVersionModel, { manyToOne: [MODEL_PROJECT] }],
  [MODEL_RISK_RATING]: [RiskRatingModel, {}],
  [MODEL_TAXON_CLASS]: [TaxonClassModel, {}],
  [MODEL_TAXON_SPECIES_CALL]: [TaxonSpeciesCallModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_IUCN]: [TaxonSpeciesIucnModel, { oneToOne: [MODEL_TAXON_SPECIES], manyToOne: [MODEL_RISK_RATING] }],
  [MODEL_TAXON_SPECIES]: [TaxonSpeciesModel, { manyToOne: [MODEL_TAXON_CLASS] }],
  [MODEL_TAXON_SPECIES_PHOTO]: [TaxonSpeciesPhotoModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_PROJECT_FILE]: [TaxonSpeciesProjectFileModel, {}],
  [MODEL_TAXON_SPECIES_PROJECT]: [TaxonSpeciesProjectModel, { manyToOne: [MODEL_PROJECT, MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_RFCX]: [TaxonSpeciesRfcxModel, { oneToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_WIKI]: [TaxonSpeciesWikiModel, { oneToOne: [MODEL_TAXON_SPECIES] }],

  // Views
  [MODEL_DASHBOARD_DETECTION_BY_HOUR]: [DashboardDetectionByHourModel],
  [MODEL_DASHBOARD_DETECTION_BY_SITE]: [DashboardDetectionBySiteModel],
  [MODEL_DASHBOARD_RICHNESS_BY_HOUR]: [DashboardRichnessByHourModel],
  [MODEL_DASHBOARD_RICHNESS_BY_RISK]: [DashboardRichnessByRiskModel],
  [MODEL_DASHBOARD_RICHNESS_BY_SITE]: [DashboardRichnessBySiteModel],
  [MODEL_DASHBOARD_RICHNESS_BY_TAXON]: [DashboardRichnessByTaxonModel],
  [MODEL_DASHBOARD_SPECIES_HIGHLIGHTED]: [DashboardSpeciesHighlightedModel],
  [MODEL_DASHBOARD_SPECIES_THREATENED]: [DashboardSpeciesThreatenedModel],
  [MODEL_DETECTION_BY_SITE_HOUR]: [DetectionBySiteHourModel],
  [MODEL_PROJECT_METRIC]: [ProjectMetricModel],
  [MODEL_SPECIES_IN_PROJECT]: [SpeciesInProjectModel],

  // Caches
  // TODO - Delete these & use redis
  [MODEL_CACHE_USER_PROJECT]: [CacheUserProjectModel, {}]
}

export type ModelRegistrations = typeof modelRegistrations
