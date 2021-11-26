import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { getSpeciesInformation, getSpeciesRank, getSpeciesRedirectLink } from './iucn/iucn.js'
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

const speciesData = JSON.parse(rawSpeciesData).map((s: Species) => {
  return { ...s, external_links: [] }
})
const speciesWithWikiInfo = await getAllSpeciesDataWithWiki(speciesData)
const speciesWithIUCNInfo = await getAllSpeciesDataWithIUCN(speciesWithWikiInfo)
const json = JSON.stringify(speciesWithIUCNInfo, null, 2)
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
      console.log('error Wiki', e.code, species.scientific_name)
    })
  const updatedData = species
  if (wikiInformation?.content) {
    updatedData.information = {
      description: wikiInformation?.content ?? '',
      source_type: 'Wiki',
      source_url: wikiInformation?.contentUrls.desktop
    }

    updatedData.external_links?.push({
      title: 'Wiki',
      source_type: 'Wiki',
      source_url: wikiInformation?.contentUrls.desktop
    })
  }
  updatedData.thumbnail_image = wikiInformation?.thumbnailImage

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
  const iucnRank = await getSpeciesRank(species.scientific_name)
    .catch(e => {
      console.error('error IUCN rank:', e)
    })
  const iucnInformation = await getSpeciesInformation(species.scientific_name)
    .catch(e => {
      console.log('error IUCN information:', e, species.scientific_name)
    })
  const iucnSourceLink = getSpeciesRedirectLink(species.scientific_name)
  const iucnDesc = (iucnInformation?.habitat ?? iucnInformation?.rationale ?? iucnInformation?.taxonomicnotes)
  const updatedData = species

  if (iucnRank) {
    updatedData.iucn_rank = iucnRank
    updatedData.external_links?.push({
      title: 'IUCN',
      source_type: 'IUCN',
      source_url: `${process.env.IUCN_BASE_URL ?? ''}/website/${species.scientific_name}`
    })
  } else {
    updatedData.iucn_rank = null
  }
  if (iucnDesc) {
    updatedData.information = {
      description: iucnDesc ?? '',
      source_type: 'IUCN',
      source_url: iucnSourceLink
    }
  }

  return updatedData
}
