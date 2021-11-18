import { FastifyPluginAsync } from 'fastify'
import * as fs from 'fs'
import { resolve } from 'path'

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
    if (speciesId == null) return { error: 'missing speciesId' }
    return JSON.parse(rawSpeciesData).filter((s: { species_id: any }) => s.species_id === speciesId)
  })

  app.get<SpeciesRoute>('/species/:speciesName', async (req, res) => {
    // Inputs & validation
    const { speciesName } = req.params
    if (!speciesName) return { error: 'missing speciesName' }
    const matchesSpecies = JSON.parse(rawSpeciesData).filter((s: { scientific_name: any }) => s.scientific_name.search(speciesName) !== -1)

    if (matchesSpecies.length === 0) return { error: 'illegal filename' }
    return matchesSpecies[0]
  })
}
