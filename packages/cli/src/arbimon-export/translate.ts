import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

import { ArbimonHourlySpeciesRow } from './types'

// Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)
const inputFilePath = resolve(currentDir, './raw-summaries.json')
const outputFilePath = resolve(currentDir, './raw-summaries.ts')
const outputConstName = 'rawSummaries'

// Ingest raw data
const rawSpeciesRichnessStringOrBuffer = fs.readFileSync(inputFilePath)
const rawSpeciesRichnessData = Buffer.isBuffer(rawSpeciesRichnessStringOrBuffer)
  ? rawSpeciesRichnessStringOrBuffer.toString()
  : rawSpeciesRichnessStringOrBuffer

// Transform as needed & write
const output = jsonToTs(transformCalculateDetectionFrequency(JSON.parse(rawSpeciesRichnessData)), outputConstName)
fs.writeFileSync(outputFilePath, output, 'utf8')

// Transform functions
export function transformToSites (data: ArbimonHourlySpeciesRow[]): string {
  const splitter = '-----'
  const rawSiteList: string[] = Array.from(new Set(data.map(r => `${r.stream_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}`)))
  const siteList = rawSiteList.map(s => s.split(splitter)).map(tuple => ({ site_id: tuple[0], name: tuple[1], latitude: tuple[2], longitude: tuple[3] }))
  return JSON.stringify(siteList, null, 2)
}

export function transformToSelectedSites (data: ArbimonHourlySpeciesRow[]): string {
  const d = data.filter(i => i.date === '2021-04-07T00:00:00.000Z')
  return JSON.stringify(d, null, 2)
}

export function transformCalculateDetectionFrequency (data: ArbimonHourlySpeciesRow[]): string {
  const d = data.map((i: ArbimonHourlySpeciesRow) => {
    return {
      ...i,
      detection_frequency: i.num_of_recordings / 12
    }
  })
  return JSON.stringify(d, null, 2)
}
