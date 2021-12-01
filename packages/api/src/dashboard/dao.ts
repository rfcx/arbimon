import * as fs from 'fs'
import lodash from 'lodash'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { EXTINCT_LIST, Species } from '../species/types.js'
import { DashboardGeneratedResponse, DashboardRichness, DashboardSpecies } from '../Z_COMMON/api-bio-types/dashboard-generated.js'
import { DashboardProfileResponse } from '../Z_COMMON/api-bio-types/dashboard-profile.js'
import { rawDetections } from '../Z_MOCK/raw-detections/raw-detections.js'

const { mapValues, sum } = lodash

// TODO: Update to query from DB
export async function getGeneratedData (): Promise<DashboardGeneratedResponse> {
  return {
    detectionCount: 50000,
    siteCount: 200,
    speciesCount: 97,
    endangeredSpecies: 10,
    richness: await getRichness(),
    endangered: await getEndangered(),
    highlighted: await getHighlighted(),
    speciesRichness: {
      time: await getRichnessDetectionByTime()
    },
    detectionFrequency: {
      time: await getDetectionFrequencyByTime()
    }
  }
}

export async function getProfile (): Promise<DashboardProfileResponse> {
  return {
    description: 'Acoustic monitoring and occupancy maps for bird and anuran species across Puerto Rico: A baseline for SWAP and other agencies’ conservation and planning activities',
    readme:
    '## Background\n\n' +
    'One of the greatest challenges of ecology is the prediction of species diversity. Traditional methods to assess species diversity often focus on direct observations of a small range of taxonomic groups and on limited spatial and temporal scales. In contrast, passive acoustic monitoring (PAM) can greatly improve our ability to predict species diversity because we can detect the presence of a wide range of animal taxa (e.g., anurans, birds, insects and mammals). In addition, our current methods for mapping species distributions are insufficient. The ability to deploy multiple acoustic sensors across landscapes in a short period of time enables simultaneous recording, which allows researchers to accurately map species distributions. Furthermore, acoustic data collected over a large spatial scale can be used to answer broader questions regarding the effects of environmental change on species phenology and distribution.\n\n' +
    'Given the high number of endemic species in Puerto Rico and the high vulnerability of these species to natural (e.g., hurricanes) and human impacts (e.g., climate change), it is essential that researchers and stakeholders take advantage of novel methods to accurately estimate the population status and species distributions of Puerto Rican fauna. Moreover, obtaining current baseline information on the distribution of Species of Greatest Conservation Need (SGCN) that have been identified in Puerto Rico State Wildlife Action Plan (SWAP) is a critical step for the development of proactive climate adaptation strategies. In addition, monitoring of SGCN is one of the Eight Critical Elements identified in the Wildlife Action Plans for each state or territory.\n\n' +
    '## Need\n\n' +
    '*Create a population baseline for bird and anuran species distributions across Puerto Rico*\n\n' +
    'Puerto Rico has a diverse bird and anuran community, including many endemic, endangered and data deficient species. While species list sexist for these groups and the distributions of a few species have been studied, state and federal agencies do not have species distribution maps for most species and the population status of many species are unknown. These baseline maps are urgently needed given the rapidly changing environment in Puerto Rico, with urban expansion in some areas, forest recovery in others, and climate change affecting the whole island.\n\n' +
    'Puerto Rico has a long history of scientific research, but most of this research has been conducted in El Yunque and little is known about species distributions and population status in the many other habitats around the island. For example, as recently as 2005 a new species of coqui was discovered in Sabana Seca (Rios-López and Thomas, 2007). To conduct effective management and conservation plans, managers and scientists need a complete picture of the distributions of the species they are working with. Fortunately, technological advances (e.g., acoustic monitoring and cloud computing) have made it possible to do extensive and frequent monitoring of multiple species and provide results in near real-time at a reasonable cost.\n\n' +
    '## Purpose\n\n' +
    'The purpose of this project is to create detailed species distribution maps for birds and anurans across Puerto Rico and its associated islands. Emphasis will be given on the species identified as of Greatest Conservation Need (Puerto Rico SWAP 2015).\n\n' +
    '## Funding\n\n' +
    'This projected had been funded by [PR DRNA](https://www.drna.pr.gov) (2021-000060) and [USFWS](https://www.fws.gov) (F20AC11127)\n\n' +
    '## Stakeholders\n\n' +
    '- [Departamento de Recursos Naturales y Ambientales de Puerto Rico](https://www.drna.pr.gov)\n' +
    '- [U.S. Fish and Wildlife Service](https://www.fws.gov)\n' +
    '- [Para la Naturaleza](https://www.paralanaturaleza.org/en/)\n' +
    '- [Rainforest Connection (marconi@rfcx.org)](https://rfcx.org/)\n'
  }
}

export async function getRichness (): Promise<DashboardRichness[]> {
  return [
    {
      taxonClass: 'Amphibians',
      speciesNo: 10
    },
    {
      taxonClass: 'Birds',
      speciesNo: 75
    },
    {
      taxonClass: 'Mammals',
      speciesNo: 12
    }
  ]
}

// TODO ??? - Getting species data from DB instead (The code is from species controller)
const currentDir = dirname(fileURLToPath(import.meta.url))

const mockSpeciesPath = resolve(currentDir, '../species/raw-species.json')

// Ingest raw data
const rawSpeciesStringOrBuffer = fs.readFileSync(mockSpeciesPath)
const rawSpeciesData = Buffer.isBuffer(rawSpeciesStringOrBuffer)
  ? rawSpeciesStringOrBuffer.toString()
  : rawSpeciesStringOrBuffer

export async function getEndangered (): Promise<DashboardSpecies[]> {
  const species = JSON.parse(rawSpeciesData)
    .filter((item: Species) => EXTINCT_LIST.includes(item.speciesCategory ?? ''))
    .map((item: Species) => {
      return {
        speciesId: item.speciesId,
        speciesSlug: item.speciesSlug,
        speciesName: item.scientificName,
        speciesCategory: item.speciesCategory,
        className: item.taxon,
        thumbnailImageUrl: item.thumbnailImageUrl
      }
    })
    .sort((a: DashboardSpecies, b: DashboardSpecies) => {
      return EXTINCT_LIST.indexOf(b.speciesCategory) - EXTINCT_LIST.indexOf(a.speciesCategory) || a.speciesName.localeCompare(b.speciesName)
    })
  return species.length <= 10 ? species : species.slice(0, 10)
}

export async function getHighlighted (): Promise<DashboardSpecies[]> {
  return JSON.parse(rawSpeciesData).slice(0, 5)
    .map((item: Species) => {
      return {
        speciesId: item.speciesId,
        speciesSlug: item.speciesSlug,
        speciesName: item.scientificName,
        speciesCategory: item.speciesCategory,
        className: item.taxon,
        thumbnailImageUrl: item.thumbnailImageUrl
      }
    })
}

export async function getRichnessDetectionByTime (): Promise<Record<number, number>> {
  return mapValues(groupByNumber(rawDetections, d => d.hour), detections => new Set(detections.map(d => d.species_id)).size)
}

export async function getDetectionFrequencyByTime (): Promise<Record<number, number>> {
  const totalRecordingCount = new Set(rawDetections.map(d => `${d.date}-${d.hour}`)).size * 12
  return mapValues(groupByNumber(rawDetections, d => d.hour), detections => {
    const detectionCount = sum(detections.map(d => d.num_of_recordings))
    return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
  })
}

// TODO: Remove this function and use it from `utils/src/lodash-ext/index.ts` instead
export const groupByNumber = <T>(data: T[], keySelector: ((k: T) => number)): Record<number, T[]> => {
  const result: Record<number, T[]> = {}

  for (const datum of data) {
    const key = keySelector(datum)
    if (!(key in result)) {
      result[key] = [datum]
    } else {
      result[key].push(datum)
    }
  }

  return result
}
