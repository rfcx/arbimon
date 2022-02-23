import { DashboardRichnessByTaxonModel, MODEL_DASHBOARD_RICHNESS_BY_TAXON } from './models/dashboard-richness-by-taxon-model'
import { DashboardSpeciesHighlightedModel, MODEL_DASHBOARD_SPECIES_HIGHLIGHTED } from './models/dashboard-species-highlighted-model'
import { DashboardSpeciesThreatenedModel, MODEL_DASHBOARD_SPECIES_THREATENED } from './models/dashboard-species-threatened-model'
import { DetectionBySiteSpeciesHourModel, MODEL_DETECTION_BY_SITE_SPECIES_HOUR } from './models/detection-by-site-species-hour-model'
import { LocationProjectMetricModel, MODEL_LOCATION_PROJECT_METRIC } from './models/location-project-metric-model'
import { LocationProjectModel, MODEL_LOCATION_PROJECT } from './models/location-project-model'
import { LocationProjectProfileModel, MODEL_LOCATION_PROJECT_PROFILE } from './models/location-project-profile-model'
import { LocationProjectSpeciesModel, MODEL_LOCATION_PROJECT_SPECIES } from './models/location-project-species-model'
import { LocationSiteModel, MODEL_LOCATION_SITE } from './models/location-site-model'
import { MODEL_RISK_RATING_IUCN, RiskRatingIucnModel } from './models/risk-rating-iucn-model'
import { MODEL_SPECIES_IN_PROJECT, SpeciesInProjectModel } from './models/species-in-project-model'
import { MODEL_TAXON_CLASS, TaxonClassModel } from './models/taxon-class-model'
import { MODEL_TAXON_SPECIES_CALL, TaxonSpeciesCallModel } from './models/taxon-species-call-model'
import { MODEL_TAXON_SPECIES_IUCN, TaxonSpeciesIucnModel } from './models/taxon-species-iucn-model'
import { MODEL_TAXON_SPECIES, TaxonSpeciesModel } from './models/taxon-species-model'
import { MODEL_TAXON_SPECIES_PHOTO, TaxonSpeciesPhotoModel } from './models/taxon-species-photo-model'
import { MODEL_TAXON_SPECIES_RFCX, TaxonSpeciesRfcxModel } from './models/taxon-species-rfcx-model'
import { MODEL_TAXON_SPECIES_WIKI, TaxonSpeciesWikiModel } from './models/taxon-species-wiki-model'

export const modelRegistrations = <const>{
  // Tables
  [MODEL_DETECTION_BY_SITE_SPECIES_HOUR]: [DetectionBySiteSpeciesHourModel, { manyToOne: [MODEL_LOCATION_SITE, MODEL_TAXON_SPECIES] }],
  [MODEL_LOCATION_PROJECT]: [LocationProjectModel, {}],
  [MODEL_LOCATION_PROJECT_PROFILE]: [LocationProjectProfileModel, { oneToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_LOCATION_PROJECT_SPECIES]: [LocationProjectSpeciesModel, { manyToOne: [MODEL_LOCATION_PROJECT, MODEL_TAXON_SPECIES] }],
  [MODEL_LOCATION_SITE]: [LocationSiteModel, { manyToOne: [MODEL_LOCATION_PROJECT] }],
  [MODEL_RISK_RATING_IUCN]: [RiskRatingIucnModel, {}],
  [MODEL_TAXON_CLASS]: [TaxonClassModel, {}],
  [MODEL_TAXON_SPECIES_CALL]: [TaxonSpeciesCallModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_IUCN]: [TaxonSpeciesIucnModel, { oneToOne: [MODEL_TAXON_SPECIES], manyToOne: [MODEL_RISK_RATING_IUCN] }],
  [MODEL_TAXON_SPECIES]: [TaxonSpeciesModel, { manyToOne: [MODEL_TAXON_CLASS] }],
  [MODEL_TAXON_SPECIES_PHOTO]: [TaxonSpeciesPhotoModel, { manyToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_RFCX]: [TaxonSpeciesRfcxModel, { oneToOne: [MODEL_TAXON_SPECIES] }],
  [MODEL_TAXON_SPECIES_WIKI]: [TaxonSpeciesWikiModel, { oneToOne: [MODEL_TAXON_SPECIES] }],

  // Views
  [MODEL_DASHBOARD_RICHNESS_BY_TAXON]: [DashboardRichnessByTaxonModel, {}],
  [MODEL_DASHBOARD_SPECIES_HIGHLIGHTED]: [DashboardSpeciesHighlightedModel, {}],
  [MODEL_DASHBOARD_SPECIES_THREATENED]: [DashboardSpeciesThreatenedModel, {}],
  [MODEL_LOCATION_PROJECT_METRIC]: [LocationProjectMetricModel, {}],
  [MODEL_SPECIES_IN_PROJECT]: [SpeciesInProjectModel, {}]
}

export type ModelRegistrations = typeof modelRegistrations
