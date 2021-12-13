import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { ArbimonHourlyDetectionSummary } from './types'

// Script Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)
const inputDetectionsPath = resolve(currentDir, './raw-detections-by-hour.json')
const outputPath = resolve(currentDir, './raw-detections-by-hour.ts')
const outputTsConstName = 'rawDetections'

const main = async (): Promise<void> => {
  // Read inputs
  const rawDetections: ArbimonHourlyDetectionSummary[] = JSON.parse(fs.readFileSync(inputDetectionsPath, 'utf8'))

  // Transform
  const output = transformCalculateDetectionFrequency(rawDetections)
  const outputTs = objectToTs(output, outputTsConstName)

  // Write outputs
  fs.writeFileSync(outputPath, outputTs, 'utf8')
}

const transformCalculateDetectionFrequency = (data: ArbimonHourlyDetectionSummary[]): MockHourlyDetectionSummary[] =>
  data.map(summary => ({
      ...summary,
      detection_frequency: summary.num_of_recordings / 12
  }))

await main()
