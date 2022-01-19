import * as fs from 'fs'
import { resolve } from 'path'

import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { limitUnlessProduction } from '../../_services/modes'
import { getMockDataDirectory } from '../../_services/output'
import { getScientificNamesFromMock } from './input-from-mock-detections'
import { getMergedSpecies } from './output-mock'

const outputPath = resolve(getMockDataDirectory(), './raw-species.ts')
const outputTsConstName = 'rawSpecies'

const main = async (): Promise<void> => {
  const scientificNames = limitUnlessProduction(getScientificNamesFromMock())
  const species = await getMergedSpecies(scientificNames)

  const outputTs = objectToTs(species, outputTsConstName, 'Species[]', 'import { Species } from \'../api-bio/species/common\'')
  fs.writeFileSync(outputPath, outputTs, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
  process.exit(0)
}

await main()
