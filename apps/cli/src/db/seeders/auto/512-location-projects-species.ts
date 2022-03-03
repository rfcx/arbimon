import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectSpeciesModel } from '@rfcx-bio/common/dao/models/location-project-species-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { LocationProjectSpecies } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { projectSpeciesPuertoRico } from '../_data/location-project-species-puerto-rico'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const species = await TaxonSpeciesModel(sequelize).findAll()
  const speciesSlugToId: Record<string, number> = Object.fromEntries(species.map(s => [s.slug, s.id]))

  const projectsSpeciesList: LocationProjectSpecies[] = projectSpeciesPuertoRico
    .map(({ slug, highlightedOrder, riskRatingLocalCode, riskRatingLocalLevel, riskRatingLocalSource }) => {
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        locationProjectId: 1,
        taxonSpeciesId,
        highlightedOrder,
        riskRatingLocalCode,
        riskRatingLocalLevel,
        riskRatingLocalSource
      }
    })
    .filter(isDefined)

  await LocationProjectSpeciesModel(params.context.sequelize).bulkCreate(projectsSpeciesList)
}
