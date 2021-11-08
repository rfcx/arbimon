/* eslint-disable no-unused-vars */
import * as fs from 'fs'
import { dirname, resolve } from 'path'
import { ArbimonHourlySpeciesRow } from './types'

const __dirname = dirname(new URL(import.meta.url).pathname)
const inputFilename = resolve(__dirname, './raw-PR-data.json')
const outputFilename = resolve(__dirname, './raw-PR-frequency.json')

const rawSpeciesRichnessStringOrBuffer = fs.readFileSync(inputFilename)
const rawSpeciesRichnessData = Buffer.isBuffer(rawSpeciesRichnessStringOrBuffer)
  ? rawSpeciesRichnessStringOrBuffer.toString() 
  : rawSpeciesRichnessStringOrBuffer

// Call fuction that needed
transformRawNumberOfDetectionToFrequency(JSON.parse(rawSpeciesRichnessData), outputFilename)

/**
 * Transfrom raw data into site list json file
 * @param  {[Object]} data raw species richness data
 * @param  {[String]} filePath json desination path
 */
export function transformToSitesAndExportAsJSONFile (data: ArbimonHourlySpeciesRow[], filePath: string) {
  const splitter = '-----'
  const rawSiteList: string[] = Array.from(new Set(data.map(r => `${r.stream_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}`)))
  const siteList = rawSiteList.map(s => s.split(splitter)).map(tuple => ({ site_id: tuple[0], name: tuple[1], latitude: tuple[2], longitude: tuple[3] }))
  const json = JSON.stringify(siteList, null, 2)
  fs.writeFileSync(filePath, json, 'utf8')
}

export function transformToSelectedSitesAndExportAsJSONFile (data: ArbimonHourlySpeciesRow[], filePath: string) {
  const d = data.filter(i => i.date === '2021-04-07T00:00:00.000Z')
  const json = JSON.stringify(d, null, 2)
  fs.writeFileSync(filePath, json, 'utf8')
}

export function transformRawNumberOfDetectionToFrequency (data: ArbimonHourlySpeciesRow[], filePath: string) {
  const d = data.map((i: ArbimonHourlySpeciesRow) => {
    return {
      ...i,
      detection_frequency: i.num_of_recordings / 12
    }
  })
  const json = JSON.stringify(d, null, 2)
  fs.writeFileSync(filePath, json, 'utf8')
}
