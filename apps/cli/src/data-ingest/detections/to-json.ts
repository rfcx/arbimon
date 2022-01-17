import * as fs from 'fs'
import { resolve } from 'path'

import { getJsonOutputDirectory } from '../../_services/output'
import { getArbimonDetectionSummaries } from './input-arbimon'

const outputPath = resolve(getJsonOutputDirectory(), './raw-detections-by-hour.json')

const main = async (): Promise<void> => {
  const detections = await getArbimonDetectionSummaries()
  const outputJson = JSON.stringify(detections, undefined, 2)
  fs.writeFileSync(outputPath, outputJson, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
}

await main()
