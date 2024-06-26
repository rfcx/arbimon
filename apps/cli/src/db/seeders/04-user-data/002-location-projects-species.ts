import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectSpeciesModel } from '@rfcx-bio/node-common/dao/models/location-project-species-model'
import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'
import { type LocationProjectSpecies } from '@rfcx-bio/node-common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'
import { projectSpeciesPuertoRico } from '../_data/location-project-species-puerto-rico'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const puertoRicoProjectId = await getPuertoRicoProjectId(sequelize)
  if (Number.isNaN(puertoRicoProjectId)) return

  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize)
    .findAll()
    .then(res => Object.fromEntries(res.map(s => [s.slug, s.id])))

  // Data
  const projectsSpeciesList: LocationProjectSpecies[] = projectSpeciesPuertoRico
    .map(({ slug, highlightedOrder, riskRatingLocalCode, riskRatingLocalLevel, riskRatingLocalSource }) => {
      // Try to find species ID
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        locationProjectId: puertoRicoProjectId,
        taxonSpeciesId,
        highlightedOrder: highlightedOrder ?? 0,
        description: '',
        riskRatingLocalCode: riskRatingLocalCode ?? '',
        riskRatingLocalLevel: riskRatingLocalLevel ?? -1,
        riskRatingLocalSource: riskRatingLocalSource ?? ''
      }
    })
    .filter(isDefined)

  await LocationProjectSpeciesModel(sequelize)
    .bulkCreate(projectsSpeciesList)
}
