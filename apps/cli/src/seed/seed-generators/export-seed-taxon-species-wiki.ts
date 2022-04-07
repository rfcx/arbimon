// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { attributesExceptIdAndDates } from '@rfcx-bio/common/dao/query-helpers/attributes'

// import { toTaxonSpeciesWikiSeed } from '@/data-ingest/species/output-seed-data/to-taxon-species-wiki-seed'
// import { getSequelize } from '@/db/connections'

// const main = async (): Promise<void> => {
//   const models = ModelRepository.getInstance(getSequelize())

//   const attributes = attributesExceptIdAndDates(models.TaxonSpeciesWiki)
//   const data = await models.TaxonSpeciesWiki
//     .findAll({
//       attributes,
//       include: [{ model: models.TaxonSpecies, attributes: ['slug'], required: true }],
//       order: [[models.TaxonSpecies, 'slug']],
//       raw: true
//     })

//   toTaxonSpeciesWikiSeed(data)
// }

// await main()
