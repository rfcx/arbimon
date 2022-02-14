import { Op } from 'sequelize'

import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ProjectProfileModel } from '@rfcx-bio/common/dao/models/location-project-profile-model'
import { ProjectSpeciesModel } from '@rfcx-bio/common/dao/models/location-project-species-model'
import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { ExtinctionRiskCode } from '@rfcx-bio/common/iucn'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertParamsExist } from '../_services/validation'

export const dashboardProfileHandler: Handler<DashboardProfileResponse, DashboardProfileParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const response: DashboardProfileResponse = await getProfile(projectId)

  // Response
  return response
}

const getProfile = async (projectId: string): Promise<DashboardProfileResponse> => {
  const sequelize = getSequelize()

  const projectInformation = await ProjectProfileModel(sequelize).findOne({
    where: { locationProjectId: projectId }
  })

  const projectSpeciesModel = ProjectSpeciesModel(sequelize)
  const taxonSpeciesModel = TaxonSpeciesModel(sequelize)
  const taxonSpeciesIucnModel = TaxonSpeciesIucnModel(sequelize)
  const taxonSpeciesWikiModel = TaxonSpeciesWikiModel(sequelize)
  const riskRatingIucnModel = RiskRatingIucnModel(sequelize)
  const taxonClassModel = TaxonClassModel(sequelize)

  taxonSpeciesModel.belongsTo(taxonClassModel, { foreignKey: 'taxonClassId' })
  taxonSpeciesModel.belongsTo(taxonSpeciesIucnModel, { foreignKey: 'id' })
  taxonSpeciesModel.belongsTo(taxonSpeciesWikiModel, { foreignKey: 'id' })
  taxonSpeciesIucnModel.belongsTo(riskRatingIucnModel, { foreignKey: 'riskRatingIucnId' })
  projectSpeciesModel.belongsTo(taxonSpeciesModel, { foreignKey: 'taxonSpeciesId' })

  const speciesHighlightedResult = await projectSpeciesModel.findAll({
    where: { locationProjectId: projectId, highlightedOrder: { [Op.not]: null } },
    include: [
      {
        model: taxonSpeciesModel,
        attributes: ['slug', 'scientificName'],
        include: [
          {
            model: taxonClassModel,
            attributes: ['slug']
          },
          {
            model: taxonSpeciesIucnModel,
            attributes: ['commonName', 'riskRatingIucnId'],
            include: [
              {
                model: riskRatingIucnModel,
                attributes: ['code']
              }
            ]
          },
          {
            model: taxonSpeciesWikiModel,
            attributes: ['photoUrl']
          }
        ]
      }
    ],
    order: [
      ['highlightedOrder', 'ASC']
    ]
  }) as unknown as ProfileRawQueryResult[]

  const speciesHighlighted: DashboardSpecies[] = speciesHighlightedResult.map(({ TaxonSpecies }) => {
    const { slug, scientificName, TaxonClass, TaxonSpeciesIucn, TaxonSpeciesWiki } = TaxonSpecies
    const { commonName, RiskRatingIucn } = TaxonSpeciesIucn

    return {
      slug,
      scientificName,
      commonName,
      taxonSlug: TaxonClass.slug,
      extinctionRisk: RiskRatingIucn.code,
      photoUrl: TaxonSpeciesWiki.photoUrl
    }
  })

  return {
    summary: projectInformation?.summary ?? '',
    readme: projectInformation?.readme ?? '',
    speciesHighlighted
  }
}

interface ProfileRawQueryResult {
  locationProjectId: number
  taxonSpeciesId: number
  highlightedOrder: number
  description: string
  riskRatingLocalLevel: string
  riskRatingLocalCode: string
  riskRatingLocalSource: string
  createdAt: string
  updatedAt: string
  TaxonSpecies: {
    slug: string
    scientificName: string
    TaxonClass: {
      slug: string
    }
    TaxonSpeciesIucn: {
      commonName: string
      riskRatingIucnId: number
      RiskRatingIucn: {
        code: ExtinctionRiskCode
      }
    }
    TaxonSpeciesWiki: {
      photoUrl: string
    }
  }
}
