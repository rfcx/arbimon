import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ProjectSpeciesModel } from '@rfcx-bio/common/dao/models/location-project-species-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { ProjectSpecies } from '@rfcx-bio/common/dao/types/location-project-species'

const HIGHLIGHTED_SPECIES_SLUGS = [
  'amazona-vittata',
  'accipiter-striatus-venator',
  'agelaius-xanthomus',
  'setophaga-angelae',
  'antrostomus-noctitherus'
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const species = await TaxonSpeciesModel(sequelize).findAll()
  const speciesSlugToId: Record<string, number> = Object.fromEntries(species.map(s => [s.slug, s.id]))

  const projectsSpeciesList: ProjectSpecies[] = HIGHLIGHTED_SPECIES_SLUGS.map((slug, idx) => ({
    locationProjectId: 1,
    taxonSpeciesId: speciesSlugToId[slug],
    highlightedOrder: idx
  }))

  await ProjectSpeciesModel(params.context.sequelize).bulkCreate(projectsSpeciesList)
}
