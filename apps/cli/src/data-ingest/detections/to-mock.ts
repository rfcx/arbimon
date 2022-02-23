import * as fs from 'fs'
import { resolve } from 'path'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { getJsonOutputDirectory, getMockDataDirectory } from '../../_services/output'
import { getArbimonDetectionSummaries } from './input-arbimon'

const outputJsonPath = resolve(getJsonOutputDirectory(), './raw-detections-by-hour.json')
const outputTsPath = resolve(getMockDataDirectory(), './raw-detections-by-hour.ts')
const outputTsConstName = 'rawDetections'

const main = async (): Promise<void> => {
  const detections = await getArbimonDetectionSummaries(1989)
  const outputJson = JSON.stringify(detections, undefined, 2)
  const outputTs = jsonToTs(outputJson, outputTsConstName, 'MockHourlyDetectionSummary[]', 'import { MockHourlyDetectionSummary } from \'./types\'')
  fs.writeFileSync(outputJsonPath, outputJson, 'utf8')
  fs.writeFileSync(outputTsPath, outputTs, 'utf8')
  console.info(`Finished writing to\n- ${outputJsonPath}\n- ${outputTsPath}`)
  process.exit(0)
}

await main()
