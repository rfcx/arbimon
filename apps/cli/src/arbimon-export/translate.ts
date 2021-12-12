import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'
import { dateQueryParamify, urlify } from '@rfcx-bio/utils/url-helpers'

import { ArbimonHourlySpeciesRow, ArbimonSpecieCallRow } from './types'

// Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)
const rawSpeciesRichnessFilePath = resolve(currentDir, './raw-summaries.json')
const rawSpeciesCallFilePath = resolve(currentDir, './raw-species-call.json')

// Output
const outputFilePath = resolve(currentDir, './raw-species.ts')
const outputConstName = 'rawSpecies'

// Ingest raw data
const rawSpeciesRichnessStringOrBuffer = fs.readFileSync(rawSpeciesRichnessFilePath)
const rawSpeciesRichnessData = Buffer.isBuffer(rawSpeciesRichnessStringOrBuffer)
  ? rawSpeciesRichnessStringOrBuffer.toString()
  : rawSpeciesRichnessStringOrBuffer

const rawSpeciesCallStringOrBuffer = fs.readFileSync(rawSpeciesCallFilePath)
const rawSpeciesCallData = Buffer.isBuffer(rawSpeciesCallStringOrBuffer)
  ? rawSpeciesCallStringOrBuffer.toString()
  : rawSpeciesCallStringOrBuffer

// Transform as needed & write
const output = jsonToTs(transformToSpecies(JSON.parse(rawSpeciesRichnessData)), outputConstName)
fs.writeFileSync(outputFilePath, output, 'utf8')

// Transform functions
export function transformToSites (data: ArbimonHourlySpeciesRow[]): string {
  const splitter = '-----'
  const rawSiteList: string[] = Array.from(new Set(data.map(r => `${r.stream_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}${splitter}${r.alt}`)))
  const siteList = rawSiteList.map(s => s.split(splitter)).map(tuple => ({ siteId: tuple[0], name: tuple[1], latitude: tuple[2], longitude: tuple[3], altitude: tuple[4] }))
  return JSON.stringify(siteList, null, 2)
}

export function transformToSpecies (data: ArbimonHourlySpeciesRow[]): string {
  const splitter = '-----'
  const rawSpeciesList: string[] = Array.from(new Set(data.map(r => `${r.species_id}${splitter}${r.scientific_name}${splitter}${r.taxon_id}${splitter}${r.taxon}`)))
  const speciesList = rawSpeciesList.map(s => s.split(splitter)).map(tuple => ({ speciesId: parseInt(tuple[0]), speciesSlug: urlify(tuple[1]), scientificName: tuple[1], taxonId: parseInt(tuple[2]), taxon: tuple[3] }))

  if (!rawSpeciesCallData) {
    return JSON.stringify(speciesList, null, 2)
  }

  const speciesCallOutput: ArbimonSpecieCallRow[] = JSON.parse(transformToMediaURL(JSON.parse(rawSpeciesCallData)))
  const updatedSpeciesList = speciesList.map(s => {
    const speciesCall = speciesCallOutput.find(c => c.scientific_name === s.scientificName)
    if (!speciesCall) return s
    return {
      ...s,
      speciesCall: {
        mediaWavUrl: speciesCall.media_wav_url,
        mediaSpecUrl: speciesCall.media_spec_url,
        siteName: speciesCall.stream_name,
        projectName: speciesCall.project_name,
        songType: speciesCall.songtype,
        recordedAt: speciesCall.start,
        timezone: speciesCall.timezone
      }
    }
  })
  return JSON.stringify(updatedSpeciesList, null, 2)
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

export function transformToMediaURL (data: ArbimonSpecieCallRow[]): string {
  const d = data.map((i: ArbimonSpecieCallRow) => {
    return {
      ...i,
      media_wav_url: `https://media-api.rfcx.org/internal/assets/streams/${i.stream_id}_t${dateQueryParamify(i.start)}.${dateQueryParamify(i.end)}_fwav.wav`,
      media_spec_url: `https://media-api.rfcx.org/internal/assets/streams/${i.stream_id}_t${dateQueryParamify(i.start)}.${dateQueryParamify(i.end)}_fspec.png`
    }
  })
  return JSON.stringify(d, null, 2)
}
