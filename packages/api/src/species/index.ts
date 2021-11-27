import { FastifyPluginAsync } from 'fastify'
import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { ApiMissingParam, ApiNotFoundError } from '../_services/errors/index.js'
import { urlify } from '../TEMP/url-helpers/index.js'
import { Species } from './types'

// TODO ??? - Move this data to database
const currentDir = dirname(new URL(import.meta.url).pathname)
const mockSpeciesPath = resolve(currentDir, './raw-species.json')

// Ingest raw data
const rawSpeciesStringOrBuffer = fs.readFileSync(mockSpeciesPath)
const rawSpeciesData = Buffer.isBuffer(rawSpeciesStringOrBuffer)
  ? rawSpeciesStringOrBuffer.toString()
  : rawSpeciesStringOrBuffer

export const routesSpecies: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/species', async (req, res) => {
    return JSON.parse(rawSpeciesData).map((item: Species) => {
      return {
        speciesId: item.species_id,
        speciesSlug: urlify(item.scientific_name),
        speciesName: item.scientific_name,
        className: item.taxon
      }
    })
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
    return JSON.parse(rawSpeciesData).filter((s: Species) => s.species_id === speciesId)
  })

  app.get<SpeciesRoute>('/species/:speciesName', async (req, res) => {
    // Inputs & validation
    const { speciesName } = req.params
    if (!speciesName) throw ApiMissingParam('speciesName')
    const matchesSpecies = JSON.parse(rawSpeciesData).filter((s: Species) => s.scientific_name.search(speciesName) !== -1)

    if (matchesSpecies.length === 0) return ApiNotFoundError()
    return matchesSpecies[0]
  })
}
