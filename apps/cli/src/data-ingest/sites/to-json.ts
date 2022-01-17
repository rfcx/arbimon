import * as fs from 'fs'
import { resolve } from 'path'

import { getJsonOutputDirectory } from '../../_services/output'
import { getMockSites } from './input-from-mock-detections'

const outputPath = resolve(getJsonOutputDirectory(), './raw-sites.json')

const main = async (): Promise<void> => {
  const sites = getMockSites()
  const outputJson = JSON.stringify(sites, undefined, 2)
  fs.writeFileSync(outputPath, outputJson, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
}

await main()
