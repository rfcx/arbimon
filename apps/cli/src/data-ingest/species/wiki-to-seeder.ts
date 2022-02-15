import * as fs from 'fs'
import { resolve } from 'path'

import { getSequentially } from '@rfcx-bio/utils/async'
import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { limitUnlessProtected } from '~/env'
import { getSeederDataDirectory } from '~/output'
import { getScientificNamesFromMock } from './input-from-mock-detections'
import { getWikiSummary } from './input-wiki'

const outputTsPath = resolve(getSeederDataDirectory(), './taxon-species-wiki.ts')
const outputTsConstName = 'rawWikiData'

const main = async (): Promise<void> => {
  // Get data from wiki
  const scientificNames = limitUnlessProtected(getScientificNamesFromMock())
  const wikiSpeciesKeyed = await getSequentially(scientificNames, getWikiSummary)

  // Write seeder data
  const outputTs = objectToTs(wikiSpeciesKeyed, outputTsConstName, 'Record<string, WikiSummary>', 'import { WikiSummary } from \'../../../data-ingest/species/input-wiki\'')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
