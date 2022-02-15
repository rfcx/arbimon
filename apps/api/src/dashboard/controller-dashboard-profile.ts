import { Op } from 'sequelize'

import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
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
  const modelRepository = ModelRepositoryFactory.getInstance(sequelize)

  const projectInformation = await modelRepository.LocationProjectProfileModel.findOne({
    where: { locationProjectId: projectId }
  })

  const speciesHighlightedResult = await modelRepository.LocationProjectSpeciesModel.findAll({
    where: { locationProjectId: projectId, highlightedOrder: { [Op.not]: null } },
    // TODO: Inline most of these
    include: [
      {
        model: modelRepository.TaxonSpeciesModel,
        attributes: ['slug', 'scientificName'],
        include: [
          {
            model: modelRepository.TaxonClassModel,
            attributes: ['slug']
          },
          {
            model: modelRepository.TaxonSpeciesIucnModel,
            attributes: ['commonName', 'riskRatingIucnId'],
            include: [
              {
                model: modelRepository.RiskRatingIucnModel,
                attributes: ['code']
              }
            ]
          },
          {
            model: modelRepository.TaxonSpeciesWikiModel,
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
