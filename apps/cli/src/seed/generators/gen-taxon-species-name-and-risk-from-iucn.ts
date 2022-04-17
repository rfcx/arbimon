import { unzip } from 'lodash-es'
import { resolve } from 'path'
import { QueryTypes } from 'sequelize'

import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { promiseSequential } from '@rfcx-bio/utils/async'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'
import { getFirstFromImport } from '@rfcx-bio/utils/import'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesNameAndRisk, IucnSpeciesNameAndRisk } from '@/ingest/inputs/iucn-species-name-and-risk'
import { SeedTaxonSpeciesCommonName } from '@/seed/data/types'
import { SeedTaxonSpeciesRiskRating } from '@/seed/data/types/seed-taxon-species-risk-rating'
import { requireEnv } from '~/env'
import { getGeneratedDataDirectory } from './_helpers'

interface SpeciesSlugAndScientificName {
  slug: string
  scientific_name: string
}

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })

  // Scope
  const speciesWithDetections = await sequelize.query<SpeciesSlugAndScientificName>(
    `
      SELECT s.slug, s.scientific_name
      FROM taxon_species s
      WHERE s.id IN (SELECT DISTINCT taxon_species_id FROM source_detection_by_sync_site_species_hour)
      ORDER BY s.slug
      ;
    `,
    { type: QueryTypes.SELECT }
  )
  console.info(`${speciesWithDetections.length} species detected in DB`)

  // TODO: Refactor filename so it's not hard-coded twice
  const iucnMissingPath = '../data/generated/iucn-missing.js'
  const iucnMissingInSeedSlugs: string[] = await import(iucnMissingPath)
    .then(res => Object.values(res as Record<string, any>)?.[0] as string[] ?? [])
    .catch(() => [])
  console.info(`${iucnMissingInSeedSlugs.length} species previously recorded as missing in IUCN`)

  const namePath = '../data/generated/taxon-species-common-name-iucn.js'
  const nameInSeed = await getFirstFromImport<SeedTaxonSpeciesCommonName[]>(import(namePath), [])
  console.info(`${nameInSeed.length} IUCN names already in seed (may include undetected)`)

  const riskPath = '../data/generated/taxon-species-risk-rating-iucn.js'
  const riskInSeed = await getFirstFromImport<SeedTaxonSpeciesRiskRating[]>(import(riskPath), [])
  console.info(`${riskInSeed.length} IUCN risks already in seed (may include undetected)`)

  const nameInSeedSlugSet = new Set(nameInSeed.map(s => s.slug))
  const riskInSeedSlugSet = new Set(riskInSeed.map(s => s.slug))
  const iucnMissingInSeedSlugSet = new Set(iucnMissingInSeedSlugs)
  const speciesToSync = speciesWithDetections.filter(s => (!nameInSeedSlugSet.has(s.slug) || !riskInSeedSlugSet.has(s.slug)) && !iucnMissingInSeedSlugSet.has(s.slug))
  console.info(`${speciesToSync.length} species to sync`)

  if (speciesToSync.length === 0) return

  // Get data
  const nameAndRiskPromises = speciesToSync.map(async species =>
    await getIucnSpeciesNameAndRisk(iucnService, species.scientific_name)
      .then(nameAndRisk => nameRiskToSeed(species, iucnService.getIucnSpeciesSourceUrl(species.scientific_name), nameAndRisk))
  )

  const nameAndRiskNew = await promiseSequential(nameAndRiskPromises)
  const [maybeNames, maybeRisks] = unzip(nameAndRiskNew)
  const nameNew = maybeNames.filter(isDefined) as SeedTaxonSpeciesCommonName[]
  const riskNew = maybeRisks.filter(isDefined) as SeedTaxonSpeciesRiskRating[]
  console.info(`${nameNew.length} IUCN names found, ${riskNew.length} IUCN risks found`)

  // Write descriptions
  if (nameNew.length > 0) {
    const nameAll = nameInSeed
      .concat(nameNew)
      .sort((a, b) => a.slug.localeCompare(b.slug))

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-common-name-iucn.ts'),
      nameAll,
      'taxonSpeciesCommonNameIucn',
      'SeedTaxonSpeciesCommonName[]',
      'import { SeedTaxonSpeciesCommonName } from \'../types\''
    )
  }

  if (riskNew.length > 0) {
    const riskAll = riskInSeed
      .concat(riskNew)
      .sort((a, b) => a.slug.localeCompare(b.slug))

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-risk-rating-iucn.ts'),
      riskAll,
      'taxonSpeciesRiskRatingIucn',
      'SeedTaxonSpeciesRiskRating[]',
      'import { SeedTaxonSpeciesRiskRating } from \'../types\''
    )
  }

  // Write IUCN missing (reduce future spamming)
  const nameRiskNewSlugSet = new Set([...nameNew.map(s => s.slug), ...riskNew.map(s => s.slug)])
  const iucnMissingNewSlugs = speciesToSync.map(s => s.slug).filter(slug => !nameRiskNewSlugSet.has(slug))
  console.info(`${iucnMissingNewSlugs.length} IUCN names/risks NOT found`)

  if (iucnMissingNewSlugs.length > 0) {
    const iucnMissingAllSlugs = iucnMissingInSeedSlugs
      .concat(iucnMissingNewSlugs)
      .sort()

    objectToTsFile( // TODO: Fix quote when writing arrays
      resolve(getGeneratedDataDirectory(), './iucn-missing.ts'),
      iucnMissingAllSlugs,
      'missingSlugs',
      'string[]'
    )
  }
}

const nameRiskToSeed = (species: SpeciesSlugAndScientificName, sourceUrl: string, nameAndRisk?: IucnSpeciesNameAndRisk): [SeedTaxonSpeciesCommonName | undefined, SeedTaxonSpeciesRiskRating | undefined] => [
  nameToSeed(species, nameAndRisk?.commonName),
  riskToSeed(species, sourceUrl, nameAndRisk?.riskRatingCode)
]

const nameToSeed = (species: SpeciesSlugAndScientificName, commonName?: string): SeedTaxonSpeciesCommonName | undefined => {
  if (!commonName) return undefined

  return {
    slug: species.slug,
    commonName
  }
}

const riskToSeed = (species: SpeciesSlugAndScientificName, sourceUrl: string, riskRatingCode?: string): SeedTaxonSpeciesRiskRating | undefined => {
  if (!riskRatingCode) return undefined
  if (!(riskRatingCode in masterRiskRatings)) {
    console.warn(`Risk rating code ${riskRatingCode} not found in master data`)
    return undefined
  }

  return {
    slug: species.slug,
    riskRatingId: masterRiskRatings[riskRatingCode as keyof typeof masterRiskRatings].id,
    sourceUrl
  }
}

await main()
