import { FastifyPluginAsync } from 'fastify'
import * as fs from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { ApiMissingParam, ApiNotFoundError } from '../_services/errors/index.js'
import { Species } from './types'

// TODO ??? - Move this data to database
const currentDir = dirname(fileURLToPath(import.meta.url))
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
        speciesId: item.speciesId,
        speciesSlug: item.speciesSlug,
        speciesName: item.scientificName,
        className: item.taxon
      }
    })
  })

  interface SpeciesRoute {
    Params: {
      speciesSlug?: string
    }
  }

  app.get<SpeciesRoute>('/species/:speciesSlug', async (req, res) => {
    // Inputs & validation
    const { speciesSlug } = req.params
    if (!speciesSlug) throw ApiMissingParam('speciesSlug')
    const matchesSpecies = JSON.parse(rawSpeciesData).filter((s: Species) => s.speciesSlug.search(speciesSlug) !== -1)

    if (matchesSpecies.length === 0) return ApiNotFoundError()
    return matchesSpecies[0]
  })
}
