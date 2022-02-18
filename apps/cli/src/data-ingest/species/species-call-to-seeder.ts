import * as fs from 'fs'
import { resolve } from 'path'

import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { getSeederDataDirectory } from '~/output'
import { getArbimonSpeciesCalls } from './input-arbimon-species-call'

const outputTsPath = resolve(getSeederDataDirectory(), './taxon-species-call.ts')
const outputTsConstName = 'rawSpeciesCallData'

const main = async (): Promise<void> => {
  // Get data from wiki
  const arbimonSpeciesCallsKeyed = await getArbimonSpeciesCalls()
  // Write seeder data
  const outputTs = objectToTs(arbimonSpeciesCallsKeyed, outputTsConstName, 'Record<string, ArbimonSpeciesCall[]>', 'import { ArbimonSpeciesCall } from \'../../../data-ingest/species/input-arbimon-species-call\'')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
