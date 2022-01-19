import * as fs from 'fs'
import { resolve } from 'path'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { getJsonOutputDirectory, getMockDataDirectory } from '../../_services/output'
import { getMockSites } from './input-from-mock-detections'

const outputJsonPath = resolve(getJsonOutputDirectory(), './raw-sites.json')
const outputTsPath = resolve(getMockDataDirectory(), './raw-sites.ts')
const outputTsConstName = 'rawSites'

const main = async (): Promise<void> => {
  const sites = getMockSites()
  const outputJson = JSON.stringify(sites, undefined, 2)
  const outputTs = jsonToTs(outputJson, outputTsConstName, 'Site[]', 'import { Site } from \'../api-bio/common/sites\'')
  fs.writeFileSync(outputJsonPath, outputJson, 'utf8')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputJsonPath}\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
