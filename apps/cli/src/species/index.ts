import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI } from '@rfcx-bio/common/api-bio/species/common'
import { EXTINCTION_RISK_NOT_EVALUATED } from '@rfcx-bio/common/iucn'

import { getSpeciesCommonInformation, getSpeciesInformation, getSpeciesRedirectLink } from './iucn/iucn'
import { rawSpeciesFromArbimon } from './raw-species-from-arbimon'
import { getWikiSpeciesInformation } from './wiki/wiki'

// TODO - Extract this
const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1].toLowerCase() ?? 'dev'
const MODE_PRODUCTION = 'production'
console.info(`Running species data lookup in ${MODE} mode`)

// Script config
const currentDir = dirname(new URL(import.meta.url).pathname)
const outputFilePath = resolve(currentDir, './species-with-information.json')

const MIN_DELAY = 500
// TODO - Extract this
const delay = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

async function main (): Promise<void> {
  // Read existing data
  const speciesInput = (rawSpeciesFromArbimon as Species[])
    .sort((s1, s2) => s1.scientificName.localeCompare(s2.scientificName))

  // Call APIs sequentially (to avoid spamming APIs)
  const speciesOutput: Species[] = []
  const speciesToProcess = MODE === MODE_PRODUCTION ? speciesInput : speciesInput.slice(0, 2)
  for (const species of speciesToProcess) {
    console.info(`- Requesting data for ${species.scientificName}`)
    speciesOutput.push(await updateSpeciesData(species))
  }

  // Write output
  const json = JSON.stringify(speciesOutput, null, 2)
  fs.writeFileSync(outputFilePath, json, 'utf8')
  console.info(`Finished writing to ${outputFilePath}`)
}

async function updateSpeciesData (species: Species): Promise<Species> {
  // Call APIs
  const [wikiData, iucnCommonData, iucnData] = await Promise.all([
    getWikiSpeciesInformation(species.scientificName),
    getSpeciesCommonInformation(species.scientificName),
    getSpeciesInformation(species.scientificName),
    delay(MIN_DELAY)
  ])

  // Merge data
  const informationIucn = iucnData?.habitat
  const information = [
    ...(informationIucn ? [{ description: informationIucn ?? '', sourceType: SPECIES_SOURCE_IUCN, sourceUrl: getSpeciesRedirectLink(species.scientificName), sourceCite: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)' }] : []),
    ...(wikiData?.content ? [{ description: wikiData.content, sourceType: SPECIES_SOURCE_WIKI, sourceUrl: wikiData.contentUrls.desktop }] : [])
  ]

  return {
    ...species,
    commonName: iucnCommonData?.main_common_name ?? '',
    extinctionRisk: iucnCommonData?.category ?? EXTINCTION_RISK_NOT_EVALUATED.code,
    externalLinks: information.map(({ sourceType, sourceUrl }) => ({ sourceType, sourceUrl, title: sourceType })),
    thumbnailImageUrl: wikiData?.thumbnailImage ?? '',
    imageCaption: wikiData?.title ?? '',
    information
  }
}

await main()
