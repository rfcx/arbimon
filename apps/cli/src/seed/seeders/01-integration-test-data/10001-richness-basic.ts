import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonClasses } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour, DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, Source, SpeciesInProject } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

// Mocked projects
export const testProject: Project = {
  id: 10001,
  idCore: 'integration1',
  idArbimon: 133887,
  slug: 'integration-test-project',
  slugArbimon: 'integration-test-project',
  name: 'Integration Test Project'
}

export const testProjectVersion: ProjectVersion = {
  id: 10001,
  projectId: 10001,
  isPublished: true,
  isPublic: true
}

export const testProjectVersion2: ProjectVersion = {
  id: 10002,
  projectId: 10001001,
  isPublished: true,
  isPublic: true
}

export const testSites: ProjectSite[] = [
  {
    id: 10001001,
    idCore: 'testSite0001',
    idArbimon: 1111221,
    projectId: 10001,
    projectVersionFirstAppearsId: 10001,
    name: 'Test Site',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 10001002,
    idCore: 'testSite0002',
    idArbimon: 1111222,
    projectId: 10001,
    projectVersionFirstAppearsId: 10001,
    name: 'Test Site 2',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

export const testSource: Source = {
  id: 10001,
  name: 'source-test-project-10001'
}

export const testSpeciesInProject: SpeciesInProject[] = [
  {
    projectId: 10001,
    taxonSpeciesId: 1,
    taxonSpeciesSlug: 'catto',
    taxonClassId: masterTaxonClasses.Mammals.id,
    taxonClassSlug: masterTaxonClasses.Mammals.slug,
    scientificName: 'catto',
    commonName: masterTaxonClasses.Mammals.commonName,
    description: '',
    sourceUrl: '',
    sourceCite: '',
    riskRatingId: 600,
    riskRatingGlobalId: 600,
    riskRatingLocalId: 600,
    photoUrl: ''
  },
  {
    projectId: 10001,
    taxonSpeciesId: 2,
    taxonSpeciesSlug: 'cobra',
    taxonClassId: masterTaxonClasses.Amphibians.id,
    taxonClassSlug: masterTaxonClasses.Amphibians.slug,
    scientificName: 'cobra',
    commonName: masterTaxonClasses.Amphibians.commonName,
    description: '',
    sourceUrl: '',
    sourceCite: '',
    riskRatingId: 600,
    riskRatingGlobalId: 600,
    riskRatingLocalId: 600,
    photoUrl: ''
  },
  {
    projectId: 10001,
    taxonSpeciesId: 3,
    taxonSpeciesSlug: 'eagle',
    taxonClassId: masterTaxonClasses.Birds.id,
    taxonClassSlug: masterTaxonClasses.Birds.slug,
    scientificName: 'eagle',
    commonName: masterTaxonClasses.Birds.commonName,
    description: '',
    sourceUrl: '',
    sourceCite: '',
    riskRatingId: 600,
    riskRatingGlobalId: 600,
    riskRatingLocalId: 600,
    photoUrl: ''
  },
  {
    projectId: 10001,
    taxonSpeciesId: 4,
    taxonSpeciesSlug: 'sparrow',
    taxonClassId: masterTaxonClasses.Birds.id,
    taxonClassSlug: masterTaxonClasses.Birds.slug,
    scientificName: 'sparrow',
    commonName: masterTaxonClasses.Birds.commonName,
    description: '',
    sourceUrl: '',
    sourceCite: '',
    riskRatingId: 600,
    riskRatingGlobalId: 600,
    riskRatingLocalId: 600,
    photoUrl: ''
  }
]

export const testDetectionsBySourceSiteSpeciesHour: DetectionBySourceSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 1,
    detectionMinutes: '10'
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    detectionMinutes: '10'
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    detectionMinutes: '10'
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 3,
    detectionMinutes: '10'
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 4,
    detectionMinutes: '10'
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    sourceId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    detectionMinutes: '10'
  }
]

export const testDetectionsByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour[] = [
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 1,
    taxonClassId: 600,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:00:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2021-03-17T11:11:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001002,
    taxonSpeciesId: 4,
    taxonClassId: 300,
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2021-01-17T14:00:00.000Z'),
    projectVersionId: 10001,
    projectSiteId: 10001001,
    taxonSpeciesId: 2,
    taxonClassId: 100,
    countDetectionMinutes: 10
  }
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const projects: Project[] = [testProject]
  await ModelRepository.getInstance(getSequelize())
    .Project
    .bulkCreate(projects)

  // Create mocked projects versions
  const projectsVersions: ProjectVersion[] = [testProjectVersion]
  await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .bulkCreate(projectsVersions)

  // Create mocked projects sites
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(testSites)

  // Create mocked source
  const source: Source[] = [testSource]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)

  // Create summary of mocked validated detections
  await ModelRepository.getInstance(getSequelize())
    .DetectionBySourceSiteSpeciesHour
    .bulkCreate(testDetectionsBySourceSiteSpeciesHour)

   // Create summary of mocked hourly validated detections
   await ModelRepository.getInstance(getSequelize())
     .DetectionByVersionSiteSpeciesHour
     .bulkCreate(testDetectionsByVersionSiteSpeciesHour)
}
