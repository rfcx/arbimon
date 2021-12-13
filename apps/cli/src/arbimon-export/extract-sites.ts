import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { ArbimonHourlyDetectionSummary } from './types'

// Script Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)
const inputDetectionsPath = resolve(currentDir, './raw-detections-by-hour.json')
const outputPath = resolve(currentDir, './raw-sites.ts')
const outputTsConstName = 'rawSites'

const main = async (): Promise<void> => {
  // Read inputs
  const rawDetections: ArbimonHourlyDetectionSummary[] = JSON.parse(fs.readFileSync(inputDetectionsPath, 'utf8'))

  // Transform
  const output = transformToSites(rawDetections)
  const outputTs = objectToTs(output, outputTsConstName)

  // Write outputs
  fs.writeFileSync(outputPath, outputTs, 'utf8')
}

function transformToSites (data: ArbimonHourlyDetectionSummary[]): Site[] {
  // Get unique sites from detections
  const splitter = '-----'
  const rawSiteList: string[] = Array.from(new Set(data.map(r => `${r.stream_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}${splitter}${r.alt}`)))

  // Convert to Site type
  return rawSiteList
    .map(s => s.split(splitter))
    .map(tuple => ({
      siteId: tuple[0],
      name: tuple[1],
      latitude: Number(tuple[2]),
      longitude: Number(tuple[3]),
      altitude: Number(tuple[4])
    }))
}

await main()
