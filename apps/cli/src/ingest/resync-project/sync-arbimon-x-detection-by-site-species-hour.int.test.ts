import dayjs from 'dayjs'
import { sum } from 'lodash-es'
import { afterAll, beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Site, type TaxonSpecies } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from '../outputs/projects'
import { type ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { resyncArbimonDetectionBySiteSpeciesHourBatch } from './sync-arbimon-x-detection-by-site-species-hour'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

const PROJECT_INPUT: Omit<ProjectArbimon, 'id'> = {
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
  idArbimon: 88526,
  locationProjectId: 123,
  name: 'Site 3',
  latitude: 16.742010693566815,
  longitude: 100.1923308193772,
  altitude: 0.0
}

describe('ingest > resync > detections', () => {
  beforeEach(async () => {
    // Remove and batch test species before testing
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74, 42251, 16729, 12204)')
    const SPECIES_INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
        idArbimon: 501,
        slug: 'nettapus-coromandelianus',
        taxonClassId: 300,
        scientificName: 'Nettapus coromandelianus'
      },
      {
        idArbimon: 3842,
        slug: 'merops-orientalis',
        taxonClassId: 300,
        scientificName: 'Merops orientalis'
      },
      {
        idArbimon: 2755,
        slug: 'eudynamys-scolopaceus',
        taxonClassId: 300,
        scientificName: 'Eudynamys scolopaceus'
      },
      {
        idArbimon: 9620,
        slug: 'carpodacus-erythrinus',
        taxonClassId: 300,
        scientificName: 'Carpodacus erythrinus'
      },
      {
        idArbimon: 1050,
        slug: 'falco-amurensis',
        taxonClassId: 300,
        scientificName: 'Falco amurensis'
      },
      {
        idArbimon: 1051,
        slug: 'falco-eleonorae',
        taxonClassId: 300,
        scientificName: 'Falco eleonorae'
      },
      {
        idArbimon: 12675,
        slug: 'hemidactylium-scutatum',
        taxonClassId: 300,
        scientificName: 'Hemidactylium scutatum'
      },
      {
        idArbimon: 74,
        slug: 'crypturellus-boucardi',
        taxonClassId: 300,
        scientificName: 'Crypturellus boucardi'
      },
      {
        idArbimon: 42251,
        slug: 'aepyceros-melampus',
        taxonClassId: 300,
        scientificName: 'Aepyceros melampus'
      },
      {
        idArbimon: 16729,
        slug: 'chiropotes-satanas',
        taxonClassId: 300,
        scientificName: 'Chiropotes satanas'
      },
      {
        idArbimon: 12204,
        slug: 'duttaphrynus-melanostictus',
        taxonClassId: 300,
        scientificName: 'Duttaphrynus melanostictus'
      }
    ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)

    // Delete project level data
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    // Batch project data
    await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    if (!project) return

    const ID_PROJECT = project.id

    // Batch site data
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([
      { ...SITE_INPUT, locationProjectId: ID_PROJECT },
      { ...SITE_INPUT, locationProjectId: ID_PROJECT, idCore: 'cydwrzz91cbx', idArbimon: 88528, name: 'Site 4' }
    ])
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74, 42251, 16729, 12204)')
  })

  describe('resyncArbimonDetectionBySiteSpeciesHourBatch', () => {
    test('can resync detection batch', async () => {
      // Act
      await resyncArbimonDetectionBySiteSpeciesHourBatch(PROJECT_INPUT.idArbimon, arbimonSequelize, biodiversitySequelize)

      // Assert
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

      expect(detections).toHaveLength(14)
      expect(dayjs(detections[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
      expect(dayjs(detections[1].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
      expect(dayjs(detections[2].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
      expect(dayjs(detections[3].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
      expect(dayjs(detections[4].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
      expect(detections[0].countsByMinute).toEqual([[6, 1]])
      expect(detections[1].countsByMinute).toEqual([[0, 1], [5, 1], [10, 1], [15, 1]])
      expect(detections[2].countsByMinute).toEqual([[0, 1], [5, 1]])
      expect(detections[3].countsByMinute).toEqual([[0, 1], [5, 1], [10, 1]])
      expect(detections[4].countsByMinute).toEqual([[5, 1], [10, 1]])
      expect(detections[5].countsByMinute).toEqual([[10, 1], [15, 1], [55, 1]])
      expect(detections[6].countsByMinute).toEqual([[10, 1]])
      expect(detections[7].countsByMinute).toEqual([[0, 1]])
      expect(detections[8].countsByMinute).toEqual([[0, 1]])
      expect(detections[9].countsByMinute).toEqual([[0, 1]])
      expect(detections[10].countsByMinute).toEqual([[5, 1]])
      expect(detections[11].countsByMinute).toEqual([[5, 1]])
      expect(detections[12].countsByMinute).toEqual([[10, 1]])
      expect(detections[13].countsByMinute).toEqual([[5, 1], [10, 1]])
      expect(sum(detections.map(item => item.count))).toBe(24)
    })
  })
})
