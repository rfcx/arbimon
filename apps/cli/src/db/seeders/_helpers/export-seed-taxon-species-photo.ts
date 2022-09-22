import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { attributesExceptIdAndDates } from '@rfcx-bio/common/dao/query-helpers/attributes'

import { getSequelize } from '@/db/connections'
import { toTaxonSpeciesPhotoSeed } from '@/sync/_refactor/output-seed-data/to-taxon-species-photo-seed'

const main = async (): Promise<void> => {
  const models = ModelRepository.getInstance(getSequelize())

  const attributes = attributesExceptIdAndDates(models.TaxonSpeciesPhoto)
  const data = await models.TaxonSpeciesPhoto
    .findAll({
      attributes,
      include: [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }],
      order: [[models.TaxonSpecies, 'slug']],
      raw: true
    })

  toTaxonSpeciesPhotoSeed(data)
}

await main()
