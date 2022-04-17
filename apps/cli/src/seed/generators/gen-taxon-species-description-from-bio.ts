import { groupBy, uniqBy } from 'lodash-es'
import { resolve } from 'path'
import { QueryTypes } from 'sequelize'

import { masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { objectToTsFile } from '@rfcx-bio/utils/file/json-to-ts'
import { getFirstFromImport } from '@rfcx-bio/utils/import'

import { getSequelize } from '@/db/connections'
import { SeedTaxonSpeciesDescription } from '@/seed/data/types'
import { getGeneratedDataDirectory } from '@/seed/generators/_helpers'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  // DB data
  const descriptions = await sequelize.query<{ slug: string, taxon_species_source_id: number, source_url: string, description: string }>(
    `
    SELECT ts.slug,
           tsd.taxon_species_source_id,
           tsd.source_url,
           tsd.description
    FROM taxon_species_description tsd
    JOIN taxon_species ts on tsd.taxon_species_id = ts.id
    ORDER BY ts.slug
    `,
    { type: QueryTypes.SELECT }
  )

  const {
    [masterTaxonSpeciesSources.IUCN.id]: descriptionsDbRawIucn = [],
    [masterTaxonSpeciesSources.RFCx.id]: descriptionsDbRawRfcx = [],
    [masterTaxonSpeciesSources.Wikipedia.id]: descriptionsDbRawWiki = []
  } = groupBy(descriptions, 'taxon_species_source_id')
  console.info(`Found DB descriptions: ${descriptionsDbRawIucn.length} IUCN, ${descriptionsDbRawRfcx.length} RFCX, ${descriptionsDbRawWiki.length} Wiki`)

  // Save
  if (descriptionsDbRawIucn.length > 0) {
    // TODO: Extract "merge with existing" logic
    const path = '../data/generated/taxon-species-description-iucn.js'
    const descriptionsSeedIucn = await getFirstFromImport<SeedTaxonSpeciesDescription[]>(import(path), [])
    const descriptionsDbIucn = descriptionsDbRawIucn.map(d => ({ slug: d.slug, sourceUrl: d.source_url, description: d.description }))

    const descriptionsAllIucn = uniqBy([...descriptionsSeedIucn, ...descriptionsDbIucn], 'slug')
      .sort((a, b) => a.slug.localeCompare(b.slug))

    console.info(`${descriptionsSeedIucn.length} existing + ${descriptionsDbIucn.length} in DB => ${descriptionsAllIucn.length} unique IUCN descriptions`)

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-description-iucn.ts'),
      descriptionsAllIucn,
      'taxonSpeciesDescriptionIucn',
      'SeedTaxonSpeciesDescription[]',
      'import { SeedTaxonSpeciesDescription } from \'../types\''
    )
  }

  if (descriptionsDbRawRfcx.length > 0) {
    const path = '../data/generated/taxon-species-description-rfcx.js'
    const descriptionsSeedRfcx = await getFirstFromImport<SeedTaxonSpeciesDescription[]>(import(path), [])
    const descriptionsDbRfcx = descriptionsDbRawRfcx.map(d => ({ slug: d.slug, sourceUrl: d.source_url, description: d.description }))

    const descriptionsAllRfcx = uniqBy([...descriptionsSeedRfcx, ...descriptionsDbRfcx], 'slug')
      .sort((a, b) => a.slug.localeCompare(b.slug))

    console.info(`${descriptionsSeedRfcx.length} existing + ${descriptionsDbRfcx.length} in DB => ${descriptionsAllRfcx.length} unique RFCx descriptions`)

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-description-rfcx.ts'),
      descriptionsAllRfcx,
      'taxonSpeciesDescriptionRfcx',
      'SeedTaxonSpeciesDescription[]',
      'import { SeedTaxonSpeciesDescription } from \'../types\''
    )
  }

  if (descriptionsDbRawWiki.length > 0) {
    const path = '../data/generated/taxon-species-description-wiki.js'
    const descriptionsSeedWiki = await getFirstFromImport<SeedTaxonSpeciesDescription[]>(import(path), [])
    const descriptionsDbWiki = descriptionsDbRawWiki.map(d => ({ slug: d.slug, sourceUrl: d.source_url, description: d.description }))

    const descriptionsAllWiki = uniqBy([...descriptionsSeedWiki, ...descriptionsDbWiki], 'slug')
      .sort((a, b) => a.slug.localeCompare(b.slug))

    console.info(`${descriptionsSeedWiki.length} existing + ${descriptionsDbWiki.length} in DB => ${descriptionsAllWiki.length} unique Wiki descriptions`)

    objectToTsFile(
      resolve(getGeneratedDataDirectory(), './taxon-species-description-wiki.ts'),
      descriptionsAllWiki,
      'taxonSpeciesDescriptionWiki',
      'SeedTaxonSpeciesDescription[]',
      'import { SeedTaxonSpeciesDescription } from \'../types\''
    )
  }
}

await main()
