import { FastifyPluginAsync } from 'fastify'
import * as fs from 'fs'
import { resolve } from 'path'
import { SpeciesMock } from 'species/types.js'

import { env } from '../_services/env/index.js'
import { ApiMissingParam, ApiNotFoundError } from '../_services/errors/index.js'
import { getSpeciesInformation, getSpeciesRank } from '../iucn/iucn.js'

// TODO ??? - Move this data to database
const mockSpeciesPath = resolve('./public', 'mock/raw-species.json')

// Ingest raw data
const rawSpeciesStringOrBuffer = fs.readFileSync(mockSpeciesPath)
const rawSpeciesData = Buffer.isBuffer(rawSpeciesStringOrBuffer)
  ? rawSpeciesStringOrBuffer.toString()
  : rawSpeciesStringOrBuffer

export const routesSpecies: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/species', async (req, res) => {
    return JSON.parse(rawSpeciesData).sort((a: { scientific_name: string }, b: { scientific_name: string }) => a.scientific_name.localeCompare(b.scientific_name))
  })

  interface SpeciesIdRoute {
    Params: {
      speciesId?: number
    }
  }

  interface SpeciesRoute {
    Params: {
      speciesName?: string
    }
  }

  app.get<SpeciesIdRoute>('/species/id/:speciesId', async (req, res) => {
    // Inputs & validation
    const { speciesId } = req.params
    if (speciesId == null) throw ApiMissingParam('speciesId')
    return JSON.parse(rawSpeciesData).filter((s: { species_id: any }) => s.species_id === speciesId)
  })

  app.get<SpeciesRoute>('/species/:speciesName', async (req, res) => {
    // Inputs & validation
    const { speciesName } = req.params
    if (!speciesName) throw ApiMissingParam('speciesName')
    const matchesSpecies = JSON.parse(rawSpeciesData).filter((s: { scientific_name: any }) => s.scientific_name.search(speciesName) !== -1)

    if (matchesSpecies.length === 0) return ApiNotFoundError('matching species not found')
    return matchesSpecies[0]
  })

  /** API to get species list with information from external sources */
  app.get('/speciesWithInformation', async (req, res) => {
    const speciesData = JSON.parse(rawSpeciesData)
    console.log(speciesData.length)

    const speciesDataWithIUCNRank: SpeciesMock[] = await Promise.all(
      speciesData.map(async (item: SpeciesMock) => {
        const iucnRank = await getSpeciesRank(item.scientific_name)
          .catch(e => {
          // Error: calling IUCN API
            console.error('IUCN:', e)
          })
        const updatedInfo = {
          ...item,
          iucn_rank: iucnRank
        }
        return updatedInfo
      })
    )

    // Get information
    const IUCN = 'IUCN'
    const speciesDataWithInformation: SpeciesMock[] = await Promise.all(
      speciesDataWithIUCNRank.map(async (item: SpeciesMock) => {
        const iucnInformation = await getSpeciesInformation(item.scientific_name)
          .catch(e => {
          // Error: calling IUCN API
            console.error('IUCN:', e)
          })
        if (!iucnInformation) return { ...item, information: null }
        const updatedInfo = {
          ...item,
          information: {
            description: (iucnInformation?.habitat ?? iucnInformation?.rationale ?? iucnInformation?.taxonomicnotes) ?? '',
            source_type: IUCN,
            source_url: `${env.IUCN_BASE_URL}/website/${item.scientific_name}`
          },
          external_links: [{
            title: IUCN,
            source_url: `${env.IUCN_BASE_URL}/website/${item.scientific_name}`
          }]
        }
        return updatedInfo
      })
    )

    // TODO: get image / wiki information

    return speciesDataWithInformation
  })
}
