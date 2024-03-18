import { vi } from 'vitest'

import { type CoreClassifierJob, type CoreClassifierJobClassificationSummary, type CoreClassifierJobInformation } from '../types'

const randomCoreId = (): string => (Math.random() + 1).toString(36).substring(6)
const randomArbimonId = (): number => Math.floor(Math.random() * 99999)

export const createProject = vi.fn(async (): Promise<string> => await Promise.resolve(randomCoreId()))
export const getProject = vi.fn(async (): Promise<{ external_id: number }> => await Promise.resolve({ external_id: randomArbimonId() }))
export const deleteProject = vi.fn(async (): Promise<void> => {})
export const getClassifierJobs = vi.fn(async (): Promise<CoreClassifierJob[]> => {
  return [
    {
      id: 22,
      classifierId: 105,
      projectId: 'n9nrlg45vyf0',
      queryStreams: 'GEG1,GEG4,GUG1,GUG2,GUG3,GUG5,MAG1,MAG2,MAG3,MAG4,RAG1,RAG3,RAG5,RAG6,SUG1,SUG2,SUG3,SUG4,SUG5,TOG1,TOG4,TOG5,TOG6',
      queryStart: '2022-12-01',
      queryEnd: '2022-12-31',
      queryHours: '0-23',
      minutesTotal: 1912,
      minutesCompleted: 1009,
      status: 30,
      createdById: 6816,
      createdAt: '2023-12-12T06:29:33.643Z',
      completedAt: '2023-12-13T01:47:27.529Z',
      classifier: {
        id: 105,
        name: 'BioDiv_Caribbean_PuertoRico_USFW',
        version: 3
      },
      totalDistinctClassifications: 5
    }
  ]
})

export const getClassifierJobInformation = vi.fn(async (): Promise<CoreClassifierJobInformation> => {
  return {
    id: 23,
    classifierId: 108,
    projectId: 'kd953mgodif9',
    queryStreams: 'GU*,MA*',
    queryStart: '2023-01-01',
    queryEnd: '2023-03-31',
    queryHours: '6-9',
    minutesTotal: 11948,
    minutesCompleted: 12194,
    status: 30,
    createdById: 6816,
    createdAt: '2024-01-05T22:24:48.958Z',
    completedAt: '2024-01-15T11:18:49.958Z',
    classifier: {
      id: 108,
      name: 'Gunshot',
      version: 2
    },
    streams: [
      {
        id: 'kdivmdkfogie',
        name: 'GU01'
      }
    ]
  }
})

export const getClassifierJobTotalDetectionsCount = vi.fn(async (): Promise<CoreClassifierJobClassificationSummary> => {
  return {
    reviewStatus: {
      total: 5,
      uncertain: 0,
      confirmed: 0,
      rejected: 0
    },
    classificationsSummary: [
      {
        title: 'Calciformis Cannabis',
        value: 'calciformis_cannabis_common_song',
        image: null,
        total: 2,
        uncertain: 0,
        confirmed: 0,
        rejected: 0
      }
    ]
  }
})
