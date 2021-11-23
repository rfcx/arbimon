import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { getSpeciesInformation, getSpeciesRank } from './iucn/iucn.js'
import { Species } from './types'
import { getWikiSpeciesInformation } from './wiki/wiki.js'

// Env
dotenv.config()

const currentDir = dirname(new URL(import.meta.url).pathname)
const mockSpeciesPath = resolve(currentDir, './raw-species.json')
const outputFilePath = resolve(currentDir, './species-with-information.json')

// Ingest raw data
const rawSpeciesStringOrBuffer = fs.readFileSync(mockSpeciesPath)
const rawSpeciesData = Buffer.isBuffer(rawSpeciesStringOrBuffer)
  ? rawSpeciesStringOrBuffer.toString()
  : rawSpeciesStringOrBuffer

const speciesData = JSON.parse(rawSpeciesData)
const speciesWithWikiInfo = await getAllSpeciesDataWithWiki(speciesData)
const speciesWithIUCNInfo = await getAllSpeciesDataWithIUCN(speciesWithWikiInfo)
const speciesWithIUCNRank = await getAllSpeciesDataWithIUCNRank(speciesWithIUCNInfo)
const json = JSON.stringify(speciesWithIUCNRank, null, 2)
fs.writeFileSync(outputFilePath, json, 'utf8')

export async function getAllSpeciesDataWithWiki (data: Species[]): Promise<Species[]> {
  return await Promise.all(
    data.map(async (datum: Species) => {
      return await getSpeciesDataWithWiki(datum)
    })
  )
}

export async function getSpeciesDataWithWiki (species: Species): Promise<Species> {
  const wikiInformation = await getWikiSpeciesInformation(species.scientific_name)
    .catch(e => {
      console.log('error Wiki', e, species.scientific_name)
    })
  const updatedData: Species = {
    ...species,
    information: {
      description: wikiInformation?.content ?? '',
      source_type: 'Wiki',
      source_url: wikiInformation?.contentUrls.desktop
    },
    thumbnail_image: wikiInformation?.thumbnailImage,
    external_links: []
  }
  updatedData.external_links?.push({
    title: 'Wiki',
    source_type: 'Wiki',
    source_url: wikiInformation?.contentUrls.desktop
  })
  return updatedData
}

export async function getAllSpeciesDataWithIUCN (data: Species[]): Promise<Species[]> {
  return await Promise.all(
    data.map(async (datum: Species) => {
      return await getSpeciesDataWithIUCN(datum)
    })
  )
}

export async function getSpeciesDataWithIUCN (species: Species): Promise<Species> {
  const iucnInformation = await getSpeciesInformation(species.scientific_name)
    .catch(e => {
      console.log('error IUCN', e, species.scientific_name)
    })
  const iucnDesc = (iucnInformation?.habitat ?? iucnInformation?.rationale ?? iucnInformation?.taxonomicnotes)
  const updatedData = species
  if (iucnDesc) {
    updatedData.information = {
      description: iucnDesc ?? '',
      source_type: 'IUCN',
      source_url: `${process.env.IUCN_BASE_URL ?? ''}/website/${species.scientific_name}`
    }
  }
  updatedData.external_links?.push({
    title: 'IUCN',
    source_type: 'IUCN',
    source_url: `${process.env.IUCN_BASE_URL ?? ''}/website/${species.scientific_name}`
  })
  return updatedData
}

export async function getAllSpeciesDataWithIUCNRank (data: Species[]): Promise<Species[]> {
  return await Promise.all(
    data.map(async (datum: Species) => {
      return await getSpeciesDataWithIUCNRank(datum)
    })
  )
}

export async function getSpeciesDataWithIUCNRank (species: Species): Promise<Species> {
  const iucnRank = await getSpeciesRank(species.scientific_name)
    .catch(e => {
      // Error: calling IUCN API
      console.error('error IUCN rank:', e)
    })
  if (!iucnRank) return species
  const updatedInfo = {
    ...species,
    iucn_rank: iucnRank
  }
  return updatedInfo
}
