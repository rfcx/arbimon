import { Op } from 'sequelize'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Site, type TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from '../outputs/projects'
import { type ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { syncArbimonSpeciesCallBatch } from './sync-arbimon-species-call'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

const PROJECT_INPUT: ProjectArbimon = {
  idArbimon: 1920,
  idCore: '807cuoi3cvw0',
  slug: 'rfcx-1',
  name: 'rfcx 1',
  isPrivate: 0,
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0,
  updatedAt: new Date(),
  deletedAt: null
}

const SITE_INPUT: Omit<Site, 'id'> = {
  idCore: 'cydwrzz91cbz',
  idArbimon: 88528,
  locationProjectId: 123,
  name: 'Site 3',
  latitude: 16.742010693566815,
  longitude: 100.1923308193772,
  altitude: 0.0
}

const SQL_INSERT_TEMPLATE = `
  INSERT INTO templates (template_id, project_id, recording_id, species_id, songtype_id, name, uri, x1, y1, x2, y2, date_created, deleted, source_project_id, user_id)
  VALUES ($templateId, $projectId, $recordingId, $speciesId, $songtypeId, $name, $uri, $x1, $y1, $x2, $y2, $dateCreated, $deleted, $sourceProjectId, $userId);
`
const DEFAULT_TEMPLATE = { templateId: 975, projectId: 1920, recordingId: 7047504, speciesId: 1050, songtypeId: 1, name: 'Falco', uri: 'project_1920/templates/970.png', x1: 75.24309455587392, y1: 469.36114732724906, x2: 80.86693409742121, y2: 2252.9335071707956, dateCreated: '2022-03-27 07:31:11', deleted: 0, sourceProjectId: null, userId: 1017 }

describe('ingest > sync', () => {
  beforeAll(async () => {
    // Remove and batch test species before testing
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (74, 3842, 12675, 42251, 1050)')
    const SPECIES_INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
        idArbimon: 74,
        slug: 'crypturellus-boucardi',
        taxonClassId: 300,
        scientificName: 'Crypturellus boucardi'
      },
      {
        idArbimon: 3842,
        slug: 'merops-orientalis',
        taxonClassId: 300,
        scientificName: 'Merops orientalis'
      },
      {
        idArbimon: 42251,
        slug: 'aepyceros-melampus',
        taxonClassId: 300,
        scientificName: 'Aepyceros melampus'
      },
      {
        idArbimon: 12675,
        slug: 'hemidactylium-scutatum',
        taxonClassId: 300,
        scientificName: 'Hemidactylium scutatum'
      },
      {
        idArbimon: 1050,
        slug: 'falco-amurensis',
        taxonClassId: 300,
        scientificName: 'Falco amurensis'
      }
    ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)

    // Batch data
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 976, dateCreated: '2022-03-28 07:31:11' } })
  })
  beforeEach(async () => {
    // Delete project level data
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    // Batch project data
    await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    if (!project) return

    const ID_PROJECT = project.id

    // Batch site data
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([{ ...SITE_INPUT, locationProjectId: ID_PROJECT }])
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (74, 3842, 12675, 42251, 1050)')
  })

  describe('syncArbimonSpeciesCallBatch', () => {
    const IDS_ARBIMON_BATCH = [975, 976]

    test('can sync species calls', async () => {
      // Act
      await syncArbimonSpeciesCallBatch(PROJECT_INPUT.idArbimon, arbimonSequelize, biodiversitySequelize)

      // Assert
      const speciesCalls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_BATCH } }
      })
      expect(speciesCalls).toHaveLength(2)
    })
  })
})
