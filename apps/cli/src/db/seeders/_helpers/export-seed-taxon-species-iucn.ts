import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { attributesExceptIdAndDates } from '@rfcx-bio/common/dao/query-helpers/attributes'

import { toTaxonSpeciesIucnSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-iucn-seed'
import { getSequelize } from '@/db/connections'

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
