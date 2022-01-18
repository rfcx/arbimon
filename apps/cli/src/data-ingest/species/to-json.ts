import * as fs from 'fs'
import { resolve } from 'path'

import { limitUnlessProduction } from '../../_services/modes'
import { getJsonOutputDirectory } from '../../_services/output'
import { getScientificNamesFromMock } from './input-from-mock-detections'
import { getMergedSpecies } from './output-mock'

const outputPath = resolve(getJsonOutputDirectory(), './raw-species.json')

const main = async (): Promise<void> => {
  const scientificNames = limitUnlessProduction(getScientificNamesFromMock())
  const species = await getMergedSpecies(scientificNames)

  const outputJson = JSON.stringify(species, undefined, 2)
  fs.writeFileSync(outputPath, outputJson, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
}

await main()
