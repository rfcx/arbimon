import { Op } from 'sequelize'

import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectSpecies, RiskRatingIucn, TaxonClass, TaxonSpecies, TaxonSpeciesIucn, TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'

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

  const projectInformation = await modelRepository.LocationProjectProfile.findOne({
    where: { locationProjectId: projectId }
  })

  const speciesHighlightedResult = await modelRepository.LocationProjectSpecies.findAll({
    where: { locationProjectId: projectId, highlightedOrder: { [Op.not]: null } },
    include: [
      {
        model: modelRepository.TaxonSpecies,
        attributes: ['slug', 'scientificName'],
        include: [
          { model: modelRepository.TaxonClass, attributes: ['slug'] },
          { model: modelRepository.TaxonSpeciesIucn, attributes: ['commonName', 'riskRatingIucnId'], include: [{ model: modelRepository.RiskRatingIucn, attributes: ['code'] }] },
          { model: modelRepository.TaxonSpeciesPhoto, attributes: ['photoUrl'] }
        ]
      }
    ],
    order: [['highlightedOrder', 'ASC']]
  }) as unknown as ProfileRawQueryResult[]

  const speciesHighlighted: DashboardSpecies[] = speciesHighlightedResult
    .map(({ TaxonSpecies }) => {
      const { slug, scientificName, TaxonClass, TaxonSpeciesIucn, TaxonSpeciesPhoto } = TaxonSpecies
      const { commonName, RiskRatingIucn } = TaxonSpeciesIucn

      return {
        slug,
        scientificName,
        commonName,
        taxonSlug: TaxonClass.slug,
        extinctionRisk: RiskRatingIucn.code,
        photoUrl: TaxonSpeciesPhoto.photoUrl
      }
    })

  return {
    summary: projectInformation?.summary ?? '',
    readme: projectInformation?.readme ?? '',
    speciesHighlighted
  }
}

// TODO: Can we make an `Include<TaxonSpecies, 'slug' | 'scientificName'>` type? Can sequelize be patched to return this type?!
type ProfileRawQueryResult = LocationProjectSpecies & {
  TaxonSpecies: Pick<TaxonSpecies, 'slug' | 'scientificName'> & {
    TaxonClass: Pick<TaxonClass, 'slug'>
    TaxonSpeciesIucn: Pick<TaxonSpeciesIucn, 'commonName' | 'riskRatingIucnId'> & {
      RiskRatingIucn: Pick<RiskRatingIucn, 'code'>
    }
    TaxonSpeciesPhoto: Pick<TaxonSpeciesPhoto, 'photoUrl'>
  }
}
