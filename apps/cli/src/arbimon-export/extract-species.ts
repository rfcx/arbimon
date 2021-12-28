import * as fs from 'fs'
import { keyBy } from 'lodash-es'
import { dirname, resolve } from 'path'

import { SpeciesCall } from '@rfcx-bio/common/api-bio/species/species'
import { objectToTs } from '@rfcx-bio/utils/file/json-to-ts'
import { dateQueryParamify, urlify } from '@rfcx-bio/utils/url-helpers'

import { ArbimonHourlyDetectionSummary, ArbimonSpeciesCallRow, ArbimonSpeciesData } from './types'

// Script Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)
const inputDetectionsPath = resolve(currentDir, './raw-detections-by-hour.json')
const inputSpeciesCallPath = resolve(currentDir, './raw-species-call.json')
const outputPath = resolve(currentDir, './raw-species-from-arbimon.ts')
const outputTsConstName = 'rawSpeciesFromArbimon'

const main = async (): Promise<void> => {
  // Read inputs
  const rawDetections: ArbimonHourlyDetectionSummary[] = JSON.parse(fs.readFileSync(inputDetectionsPath, 'utf8'))

  // Transform
  const output = transformToSpecies(rawDetections)
  const outputTs = objectToTs(output, outputTsConstName)

  // Write outputs
  fs.writeFileSync(outputPath, outputTs, 'utf8')
}

const transformToSpecies = (data: ArbimonHourlyDetectionSummary[]): ArbimonSpeciesData[] => {
  // Get unique species from detections
  const splitter = '-----'
  const rawSpeciesList: string[] = Array.from(new Set(data.map(r => `${r.species_id}${splitter}${r.scientific_name}${splitter}${r.taxon_id}${splitter}${r.taxon}`)))

  // Convert to Species type
  const speciesList: ArbimonSpeciesData[] = rawSpeciesList
    .map(s => s.split(splitter))
    .map(tuple => ({
      speciesId: Number(tuple[0]),
      speciesSlug: urlify(tuple[1]),
      scientificName: tuple[1],
      taxonId: Number(tuple[2]),
      taxon: tuple[3]
    }))

  // Return early if no SpeciesCall
  const rawSpeciesCallJson = fs.readFileSync(inputSpeciesCallPath, 'utf8')
  if (!rawSpeciesCallJson) return speciesList

  // Merge SpeciesCall data
  const speciesCalls: Record<string, SpeciesCall | undefined> = keyBy(transformToMediaURL(JSON.parse(rawSpeciesCallJson)), 'scientificName')
  return speciesList.map(s => {
    const speciesCall = speciesCalls[s.scientificName]
    delete speciesCall?.scientificName
    return { ...s, speciesCall: speciesCalls[s.scientificName] }
  })
}

const transformToMediaURL = (data: ArbimonSpeciesCallRow[]): SpeciesCall[] =>
  data.map(({ scientific_name: scientificName, stream_id: streamId, stream_name: siteName, project_name: projectName, songtype: songType, start: recordedAt, end, timezone }) => ({
      scientificName,
      siteName,
      projectName,
      songType,
      recordedAt,
      timezone,
      mediaWavUrl: `https://media-api.rfcx.org/internal/assets/streams/${streamId}_t${dateQueryParamify(recordedAt)}.${dateQueryParamify(end)}_fwav.wav`,
      mediaSpecUrl: `https://media-api.rfcx.org/internal/assets/streams/${streamId}_t${dateQueryParamify(recordedAt)}.${dateQueryParamify(end)}_d512.512_mtrue_fspec.png`
  }))

await main()
