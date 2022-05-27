import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { taxonSpeciesCommonNameRfcx } from '../../data/manual/taxon-species-common-name-rfcx'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Key Lookups
  const speciesSlugToId: Record<string, number> = await models.TaxonSpecies.findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  const taxonSpeciesSourceId = masterTaxonSpeciesSources.RFCx.id

  // Convert data
  const data: TaxonSpeciesCommonName[] = taxonSpeciesCommonNameRfcx
    .map(({ slug, commonName }) => {
      // Try to find species ID
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId,
        taxonSpeciesSourceId,
        commonName
      }
    })
    .filter(isDefined)

  await models.TaxonSpeciesCommonName.bulkCreate(data)
}
