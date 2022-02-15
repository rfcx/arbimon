import { Sequelize } from 'sequelize'

import { DetectionsBySiteSpeciesHourModel } from './models/detections-by-site-species-hour-model' './detections-by-site-species-hour-model'
import { LocationProjectModel }  from './models/location-project-model'
import { LocationProjectProfileModel }  from './models/location-project-profile-model'
import { LocationProjectSpeciesModel }  from './models/location-project-species-model'
import { LocationSiteModel }  from './models/location-site-model'
import { RiskRatingIucnModel }  from './models/risk-rating-iucn-model'
import { TaxonClassModel }  from './models/taxon-class-model'
import { TaxonSpeciesCallModel }  from './models/taxon-species-call-model'
import { TaxonSpeciesIucnModel }  from './models/taxon-species-iucn-model'
import { TaxonSpeciesModel }  from './models/taxon-species-model'
import { TaxonSpeciesPhotoModel }  from './models/taxon-species-photo-model'
import { TaxonSpeciesRfcxModel }  from './models/taxon-species-rfcx-model'
import { TaxonSpeciesWikiModel }  from './models/taxon-species-wiki-model'
import { mapValues } from 'lodash'

const allFactories = <const>{
  DetectionsBySiteSpeciesHourModel,
  LocationProjectModel,
  LocationProjectProfileModel,
  LocationProjectSpeciesModel,
  LocationSiteModel,
  RiskRatingIucnModel,
  TaxonClassModel,
  TaxonSpeciesCallModel,
  TaxonSpeciesIucnModel,
  TaxonSpeciesModel,
  TaxonSpeciesPhotoModel,
  TaxonSpeciesRfcxModel,
  TaxonSpeciesWikiModel,
}

type FactoryList = typeof allFactories
type ModelRepository = { [K in keyof FactoryList]: ReturnType<FactoryList[K]> }

export class ModelRepositoryFactory {
  readonly repo: ModelRepository

  static instance: ModelRepositoryFactory | undefined
  static getInstance(sequelize: Sequelize, factories: Partial<FactoryList> = allFactories): ModelRepository {
    if (!ModelRepositoryFactory.instance) { ModelRepositoryFactory.instance = new ModelRepositoryFactory(sequelize, factories) }
    return ModelRepositoryFactory.instance.repo
  }

  constructor (sequelize: Sequelize, factories: Partial<FactoryList> = allFactories) {
    this.repo = mapValues(factories, f => f?.(sequelize)) as ModelRepository

    // TODO: Extract this
    this.repo.TaxonSpeciesModel.belongsTo(this.repo.TaxonClassModel, { foreignKey: 'taxonClassId' })
    this.repo.TaxonSpeciesModel.belongsTo(this.repo.TaxonSpeciesIucnModel, { foreignKey: 'id' })
    this.repo.TaxonSpeciesModel.belongsTo(this.repo.TaxonSpeciesWikiModel, { foreignKey: 'id' })
    this.repo.TaxonSpeciesIucnModel.belongsTo(this.repo.RiskRatingIucnModel, { foreignKey: 'riskRatingIucnId' })
    this.repo.LocationProjectSpeciesModel.belongsTo(this.repo.TaxonSpeciesModel, { foreignKey: 'taxonSpeciesId' })
  }
}
