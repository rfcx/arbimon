import { resolve } from 'path'
import { QueryTypes } from 'sequelize'

import { promiseSequential } from '@rfcx-bio/utils/async'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesDescription } from '@/ingest/inputs/iucn-species-description'
import { SeedTaxonSpeciesDescription } from '@/seed/data/types'
import { requireEnv } from '~/env'
import { getGeneratedDataDirectory } from './_helpers'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })

  // Scope
  const speciesWithDetections = await sequelize.query<{ slug: string, scientific_name: string }>(
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

  const descriptionPath = '../data/generated/taxon-species-description-iucn.js'
  const descriptionsInSeed: SeedTaxonSpeciesDescription[] = await import(descriptionPath)
    .then(res => Object.values(res as Record<string, any>)?.[0] as SeedTaxonSpeciesDescription[] ?? [])
    .catch(() => [])
  console.info(`${descriptionsInSeed.length} IUCN descriptions already in seed (may include undetected)`)

  const descriptionInSeedSlugSet = new Set(descriptionsInSeed.map(s => s.slug))
  const iucnMissingInSeedSlugSet = new Set(iucnMissingInSeedSlugs)
  const speciesToSync = speciesWithDetections.filter(s => !descriptionInSeedSlugSet.has(s.slug) && !iucnMissingInSeedSlugSet.has(s.slug))
  console.info(`${speciesToSync.length} species to sync`)

  if (speciesToSync.length === 0) return

  // Get data
  const descriptionPromises = speciesToSync.map(async species =>
    await getIucnSpeciesDescription(iucnService, species.scientific_name)
      .then(description => {
        if (!description) return undefined

        const result: SeedTaxonSpeciesDescription = {
          slug: species.slug,
          sourceUrl: iucnService.getIucnSpeciesSourceUrl(species.scientific_name),
          description
        }
        return result
      })
  )

  const descriptionsNew = await promiseSequential(descriptionPromises)
    .then(res => res.filter(isDefined))
  console.info(`${descriptionsNew.length} IUCN descriptions found`)

  // Write descriptions
  if (descriptionsNew.length > 0) {
    const descriptionsAll = descriptionsInSeed
      .concat(descriptionsNew)
      .sort((a, b) => a.slug.localeCompare(b.slug))

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-description-iucn.ts'),
      descriptionsAll,
      'taxonSpeciesDescriptionIucn',
      'SeedTaxonSpeciesDescription[]',
      'import { SeedTaxonSpeciesDescription } from \'../types\''
    )
  }

  // Write IUCN missing (reduce future spamming)
  const descriptionNewSlugSet = new Set(descriptionsNew.map(s => s.slug))
  const iucnMissingNewSlugs = speciesToSync.map(s => s.slug).filter(slug => !descriptionNewSlugSet.has(slug))
  console.info(`${iucnMissingNewSlugs.length} IUCN descriptions NOT found`)

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

await main()
