import * as fs from 'fs'
import { resolve } from 'path'

import { getSequentially } from '@rfcx-bio/utils/async'
import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { limitUnlessProtected } from '~/env'
import { getJsonOutputDirectory, getMockDataDirectory } from '~/output'
import { getArbimonSpeciesCalls } from './input-arbimon-species-call'
import { getArbimonSpeciesFromMock, getScientificNamesFromMock } from './input-from-mock-detections'
import { getIucnSpecies, getIucnSpeciesNarrative } from './input-iucn'
import { getRfcxSpecies } from './input-rfcx'
import { getWikiSummary } from './input-wiki'
import { getMergedSpecies } from './output-mock'

const outputJsonPath = resolve(getJsonOutputDirectory(), './raw-species.json')
const outputTsPath = resolve(getMockDataDirectory(), './raw-species.ts')
const outputTsConstName = 'rawSpecies'

const main = async (): Promise<void> => {
    // Get data from other sources
  const scientificNames = limitUnlessProtected(getScientificNamesFromMock())
  const [arbimonSpeciesKeyed, arbimonSpeciesCallsKeyed, iucnSpeciesKeyed, iucnSpeciesNarrativesKeyed, rfcxSpeciesKeyed, wikiSpeciesKeyed] = await Promise.all([
    getArbimonSpeciesFromMock(),
    getArbimonSpeciesCalls(),
    getSequentially(scientificNames, getIucnSpecies),
    getSequentially(scientificNames, getIucnSpeciesNarrative),
    getRfcxSpecies(),
    getSequentially(scientificNames, getWikiSummary)
  ])
  const species = await getMergedSpecies(scientificNames, arbimonSpeciesKeyed, arbimonSpeciesCallsKeyed, iucnSpeciesKeyed, iucnSpeciesNarrativesKeyed, rfcxSpeciesKeyed, wikiSpeciesKeyed)

  const outputJson = JSON.stringify(species, undefined, 2)
  const outputTs = jsonToTs(outputJson, outputTsConstName, 'Species[]', 'import { Species } from \'../api-bio/species/types\'')
  fs.writeFileSync(outputJsonPath, outputJson, 'utf8')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputJsonPath}\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
