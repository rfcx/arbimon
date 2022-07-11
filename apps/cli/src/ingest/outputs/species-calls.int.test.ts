import { afterAll, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { SpeciesCallArbimon } from '../parsers/parse-species-call-arbimon-to-bio'
import { writeProjectsToBio } from './projects'
import { writeSpeciesCallsToBio } from './species-calls'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > species calls', async () => {
  afterAll(async () => {
    // Delete species data created in these tests
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (1050)')
  })

  // Batch project data before tests
  const PROJECT_INPUT: Omit<Project, 'id'> = {
    idArbimon: 1920,
    idCore: '807cuoi3cvw0',
    slug: 'rfcx-1',
    name: 'rfcx 1',
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
  await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
  const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

  if (!project) return

  const ID_PROJECT = project.id

  // Batch site data
  const SITE_INPUT: Omit<Site, 'id'> = {
    idCore: 'cydwrzz91cbz',
    idArbimon: 88528,
    locationProjectId: ID_PROJECT,
    name: 'Site 3',
    latitude: 16.742010693566815,
    longitude: 100.1923308193772,
    altitude: 0.0
  }

  const site = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findOne({ where: { idArbimon: SITE_INPUT.idArbimon } })

  if (!site) await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])

  // Batch species if it takes
  const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
    idArbimon: 1050,
    slug: 'falco-amurensis',
    taxonClassId: 300,
    scientificName: 'Falco amurensis'
  }

  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })

  if (!species) await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([SPECIES_INPUT])

  const SPECIES_CALL_INPUT: SpeciesCallArbimon[] = [{
    taxonSpeciesId: 1050,
    callProjectId: 1920,
    projectSlugArbimon: 'rfcx-1',
    callSiteId: 88528,
    callRecordedAt: '2020-12-06 03:06:19',
    start: 75.24309455587392,
    end: 80.86693409742121,
    siteIdCore: 'cydwrzz91cbz',
    callType: 'Common Song',
    recordingId: 7047505,
    callTimezone: 'Asia/Bangkok',
    updatedAt: '2022-03-22 07:31:11',
    idArbimon: 980
  }]

  test('can write species calls', async () => {
    // Act
    await writeSpeciesCallsToBio(SPECIES_CALL_INPUT, biodiversitySequelize)

    // Assert
    const calls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
      where: {
        callProjectId: ID_PROJECT
      }
    })
    expect(calls.length).toBe(SPECIES_CALL_INPUT.length)
  })

  test('fail for duplicate species calls', async () => {
    // Act
    await writeSpeciesCallsToBio(SPECIES_CALL_INPUT, biodiversitySequelize)

    // Assert
    const calls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
      where: {
        callProjectId: ID_PROJECT
      }
    })
    expect(calls.length).toBe(SPECIES_CALL_INPUT.length)
  })
})
