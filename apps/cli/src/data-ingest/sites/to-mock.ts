import * as fs from 'fs'
import { resolve } from 'path'

import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { getMockDataDirectory } from '../../_services/output'
import { getMockSites } from './input-from-mock-detections'

const outputPath = resolve(getMockDataDirectory(), './raw-sites.ts')
const outputTsConstName = 'rawSites'

const main = async (): Promise<void> => {
  const sites = getMockSites()
  const outputTs = objectToTs(sites, outputTsConstName, 'Site[]', 'import { Site } from \'../api-bio/common/sites\'')
  fs.writeFileSync(outputPath, outputTs, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
  process.exit(0)
}

await main()
