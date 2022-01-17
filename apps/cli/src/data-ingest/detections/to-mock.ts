import * as fs from 'fs'
import { resolve } from 'path'

import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { getMockDataDirectory } from '../../_services/output'
import { getArbimonDetectionSummaries } from './input-arbimon'

const outputPath = resolve(getMockDataDirectory(), './raw-detections-by-hour.ts')
const outputTsConstName = 'rawDetections'

const main = async (): Promise<void> => {
  const detections = await getArbimonDetectionSummaries()
  const outputTs = objectToTs(detections, outputTsConstName, 'MockHourlyDetectionSummary[]', 'import { MockHourlyDetectionSummary } from \'./types\'')
  fs.writeFileSync(outputPath, outputTs, 'utf8')
  console.info(`Finished writing to ${outputPath}`)
}

await main()
