import { masterRiskRatings, masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName, TaxonSpeciesDescription, TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesDescription } from '@/ingest/inputs/iucn-species-description'
import { getIucnSpeciesNameAndRisk } from '@/ingest/inputs/iucn-species-name-and-risk'
import { getIucnSpeciesSourceUrl } from '@/ingest/inputs/iucn-species-source'
import { requireEnv } from '~/env'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  // Get species to sync
  const speciesToSync = await models.TaxonSpecies
    .findAll({
      // where: {} // TODO: Think of a way to track the last time each sync was attempted (ex: don't keep spamming IUCN for species they don't have)
      attributes: ['id', 'scientificName'],
      limit: 100,
      order: [['scientificName', 'ASC']],
      raw: true
    })

  console.info(`Found ${speciesToSync.length} species to sync`)

  // Call IUCN APIs (& buffer results)
  const names: TaxonSpeciesCommonName[] = []
  const risks: TaxonSpeciesRiskRating[] = []
  const descriptions: TaxonSpeciesDescription[] = []

  // TODO: Call batching
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })
  for (const species of speciesToSync) {
    const sourceUrl = getIucnSpeciesSourceUrl(IUCN_BASE_URL, species.scientificName)
    const [nameAndRisk, description] = await Promise.all([
      getIucnSpeciesNameAndRisk(iucnService, species.scientificName),
      getIucnSpeciesDescription(iucnService, species.scientificName)
    ])

    // Common name
    if (nameAndRisk?.commonName !== undefined) {
      names.push({
        taxonSpeciesId: species.id,
        taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
        commonName: nameAndRisk.commonName
      })
     }

    // Risk rating
    if (nameAndRisk?.riskRatingCode !== undefined) {
      if (nameAndRisk.riskRatingCode in masterRiskRatings) {
        risks.push({
          taxonSpeciesId: species.id,
          taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
          riskRatingId: masterRiskRatings[nameAndRisk.riskRatingCode as keyof typeof masterRiskRatings].id,
          sourceUrl
        })
      } else {
        console.warn(`Risk rating code ${nameAndRisk.riskRatingCode} not found in master data`)
      }
    }

    // Description
    if (description) {
      descriptions.push({
        taxonSpeciesId: species.id,
        taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id,
        description,
        sourceUrl
      })
    }
  }

  // Save
  console.info(`Saving ${names.length} common names, ${risks.length} risk ratings, ${descriptions.length} descriptions`)
  await models.TaxonSpeciesCommonName.bulkCreate(names)
  await models.TaxonSpeciesRiskRating.bulkCreate(risks)
  await models.TaxonSpeciesDescription.bulkCreate(descriptions)
}

await main()
