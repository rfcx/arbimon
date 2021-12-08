import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI } from '@rfcx-bio/common/api-bio-types/species'
import { EXTINCTION_RISK_NOT_EVALUATED } from '@rfcx-bio/common/iucn/index.js'

import { getSpeciesInformation, getSpeciesRank, getSpeciesRedirectLink } from './iucn/iucn.js'
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
  return { ...s, externalLinks: [] }
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
  const wikiInformation = await getWikiSpeciesInformation(species.scientificName)
    .catch(e => {
      console.log('error Wiki', e.code, species.scientificName)
    })
  const updatedData = species
  if (wikiInformation?.content) {
    updatedData.information = {
      description: wikiInformation?.content ?? '',
      sourceType: SPECIES_SOURCE_WIKI,
      sourceUrl: wikiInformation?.contentUrls.desktop
    }

    updatedData.externalLinks?.push({
      title: 'Wiki',
      sourceType: SPECIES_SOURCE_WIKI,
      sourceUrl: wikiInformation?.contentUrls.desktop
    })
  }
  updatedData.thumbnailImageUrl = wikiInformation?.thumbnailImage

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
  const iucnRank = await getSpeciesRank(species.scientificName)
    .catch(e => {
      console.error('error IUCN rank:', e)
    })
  const iucnInformation = await getSpeciesInformation(species.scientificName)
    .catch(e => {
      console.log('error IUCN information:', e, species.scientificName)
    })
  const iucnSourceLink = getSpeciesRedirectLink(species.scientificName)
  const iucnDesc = (iucnInformation?.habitat ?? iucnInformation?.rationale ?? iucnInformation?.taxonomicnotes)
  const updatedData = species

  if (iucnRank) {
    updatedData.extinctionRisk = iucnRank
    updatedData.externalLinks?.push({
      title: 'IUCN',
      sourceType: SPECIES_SOURCE_IUCN,
      sourceUrl: `${process.env.IUCN_BASE_URL ?? ''}/website/${species.scientificName}`
    })
  } else {
    updatedData.extinctionRisk = EXTINCTION_RISK_NOT_EVALUATED.code
  }
  if (iucnDesc) {
    updatedData.information = {
      description: iucnDesc ?? '',
      sourceType: SPECIES_SOURCE_IUCN,
      sourceUrl: iucnSourceLink
    }
  }

  return updatedData
}
