import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { attributesExceptIdAndDates } from '@rfcx-bio/common/dao/query-helpers/attributes'

import { getSequelize } from '@/db/connections'
import { toTaxonSpeciesIucnSeed } from '@/sync/_refactor/output-seed-data/to-taxon-species-iucn-seed'

const main = async (): Promise<void> => {
  const models = ModelRepository.getInstance(getSequelize())

  const attributes = attributesExceptIdAndDates(models.TaxonSpeciesIucn)
  const data = await models.TaxonSpeciesIucn
    .findAll({
      attributes,
      include: [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }],
      order: [[models.TaxonSpecies, 'slug']],
      raw: true
    })

  toTaxonSpeciesIucnSeed(data)
}

await main()
