import { DetectionsBySiteSpeciesHourModel, MODEL_DETECTIONS_BY_SITE_SPECIES_HOUR } from '@/dao/models/detections-by-site-species-hour-model'
import { LocationProjectModel, MODEL_LOCATION_PROJECT } from '@/dao/models/location-project-model'
import { LocationProjectProfileModel, MODEL_LOCATION_PROJECT_PROFILE } from '@/dao/models/location-project-profile-model'
import { LocationProjectSpeciesModel, MODEL_LOCATION_PROJECT_SPECIES } from '@/dao/models/location-project-species-model'
import { LocationSiteModel, MODEL_LOCATION_SITE } from '@/dao/models/location-site-model'
import { MODEL_RISK_RATING_IUCN, RiskRatingIucnModel } from '@/dao/models/risk-rating-iucn-model'
import { MODEL_TAXON_CLASS, TaxonClassModel } from '@/dao/models/taxon-class-model'
import { MODEL_TAXON_SPECIES_CALL, TaxonSpeciesCallModel } from '@/dao/models/taxon-species-call-model'
import { MODEL_TAXON_SPECIES_IUCN, TaxonSpeciesIucnModel } from '@/dao/models/taxon-species-iucn-model'
import { MODEL_TAXON_SPECIES, TaxonSpeciesModel } from '@/dao/models/taxon-species-model'
import { MODEL_TAXON_SPECIES_PHOTO, TaxonSpeciesPhotoModel } from '@/dao/models/taxon-species-photo-model'
import { MODEL_TAXON_SPECIES_RFCX, TaxonSpeciesRfcxModel } from '@/dao/models/taxon-species-rfcx-model'
import { MODEL_TAXON_SPECIES_WIKI, TaxonSpeciesWikiModel } from '@/dao/models/taxon-species-wiki-model'

export const modelRegistrations = <const>{
  [MODEL_DETECTIONS_BY_SITE_SPECIES_HOUR]: [DetectionsBySiteSpeciesHourModel, { manyToOne: [MODEL_LOCATION_SITE, MODEL_TAXON_SPECIES] }],
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
  [MODEL_TAXON_SPECIES_WIKI]: [TaxonSpeciesWikiModel, { oneToOne: [MODEL_TAXON_SPECIES] }]
}

export type ModelRegistrations = typeof modelRegistrations
