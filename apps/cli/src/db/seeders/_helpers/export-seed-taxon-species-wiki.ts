import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { attributesExceptIdAndDates } from '@rfcx-bio/node-common/dao/query-helpers/attributes'

import { getSequelize } from '@/db/connections'
import { toTaxonSpeciesWikiSeed } from '@/ingest/_refactor/output-seed-data/to-taxon-species-wiki-seed'

const main = async (): Promise<void> => {
  const models = ModelRepository.getInstance(getSequelize())

  const attributes = attributesExceptIdAndDates(models.TaxonSpeciesWiki)
  const data = await models.TaxonSpeciesWiki
    .findAll({
      attributes,
      include: [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }],
      order: [[models.TaxonSpecies, 'slug']],
      raw: true
    })

  toTaxonSpeciesWikiSeed(data)
}

await main()
