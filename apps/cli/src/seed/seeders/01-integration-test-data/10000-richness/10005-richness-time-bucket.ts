import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites,
    testDetectionsByVersionSiteSpeciesHour
  )
}

const testProject: Project = {
  id: 10005,
  idCore: 'integration5',
  idArbimon: 10005001,
  slug: 'integration-test-project5',
  name: 'Integration Test Project 5'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10005001,
    idCore: 'ts10005001',
    idArbimon: 1111225,
    name: 'Test Site 5001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10005002,
    idCore: 'ts10005002',
    idArbimon: 1111226,
    name: 'Test Site 5002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10005003,
    idCore: 'ts10005003',
    idArbimon: 1111227,
    name: 'Test Site 5003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-12-31T23:00:00.000Z'), // Friday 31 Dec, 2021 (month end, year end cases)
    projectSiteId: 10005001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Saturday 1 Jan, 2022 (month start, year start cases)
    projectSiteId: 10005001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sunday 2 Jan, 2022 (week start)
    projectSiteId: 10005002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-08T23:00:00.000Z'), // Saturday 8 Jan, 2022 (week end)
    projectSiteId: 10005003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: 10005003,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: 10005003,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 10
  }
]
