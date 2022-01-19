import * as fs from 'fs'
import { resolve } from 'path'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { limitUnlessProduction } from '../../_services/modes'
import { getJsonOutputDirectory, getMockDataDirectory } from '../../_services/output'
import { getScientificNamesFromMock } from './input-from-mock-detections'
import { getMergedSpecies } from './output-mock'

const outputJsonPath = resolve(getJsonOutputDirectory(), './raw-species.json')
const outputTsPath = resolve(getMockDataDirectory(), './raw-species.ts')
const outputTsConstName = 'rawSpecies'

const main = async (): Promise<void> => {
  const scientificNames = limitUnlessProduction(getScientificNamesFromMock())
  const species = await getMergedSpecies(scientificNames)

  const outputJson = JSON.stringify(species, undefined, 2)
  const outputTs = jsonToTs(outputJson, outputTsConstName, 'Species[]', 'import { Species } from \'../api-bio/species/common\'')
  fs.writeFileSync(outputJsonPath, outputJson, 'utf8')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputJsonPath}\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
