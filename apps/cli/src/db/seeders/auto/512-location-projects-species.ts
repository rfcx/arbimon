import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ProjectSpeciesModel } from '@rfcx-bio/common/dao/models/location-project-species-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { ProjectSpecies } from '@rfcx-bio/common/dao/types/location-project-species'

import { projectSpeciesPuertoRico } from '../_data/location-project-species-puerto-rico'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const species = await TaxonSpeciesModel(sequelize).findAll()
  const speciesSlugToId: Record<string, number> = Object.fromEntries(species.map(s => [s.slug, s.id]))

  const projectsSpeciesList: ProjectSpecies[] = projectSpeciesPuertoRico
    .map(({ slug, highlightedOrder, riskRatingLocalCode, riskRatingLocalLevel, riskRatingLocalSource }) => ({
      locationProjectId: 1,
      taxonSpeciesId: speciesSlugToId[slug],
      highlightedOrder,
      riskRatingLocalCode,
      riskRatingLocalLevel,
      riskRatingLocalSource
    }))

  await ProjectSpeciesModel(params.context.sequelize).bulkCreate(projectsSpeciesList)
}
