import { vi } from 'vitest'

import { type Classifier } from '@rfcx-bio/common/api-bio/classifiers/classifiers'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

import { CoreUpdateDetectionsStatusResponse, type CoreBestDetection, type CoreClassificationLite, type CoreClassifierJob, type CoreClassifierJobClassificationSummary, type CoreClassifierJobInformation, type CoreClassifierJobSummary, type CoreClassifierJobTotalDetections, type CoreDetection, type CoreDetectionsSummary } from '../types'

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
      }
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
    ],
    totalDistinctClassifications: 5
  }
})

export const getClassifierJobTotalDetectionsCount = vi.fn(async (): Promise<CoreClassifierJobTotalDetections> => {
  return {
    reviewStatus: {
      total: 18,
      unreviewed: 2,
      uncertain: 2,
      confirmed: 2,
      rejected: 12
    }
  }
})

export const getClassifierJobSummaries = vi.fn(async (): Promise<{ total: number, data: CoreClassifierJobClassificationSummary }> => {
  return {
    total: 92,
    data: {
      classificationsSummary: [
        {
          title: 'Calciformis Cannabis',
          value: 'calciformis_cannabis_common_song',
          image: null,
          total: 8,
          unreviewed: 1,
          uncertain: 2,
          confirmed: 5,
          rejected: 0
        },
        {
          title: 'Doodoo Cyphleris',
          value: 'doodoo_cyphleris_common_song_1',
          image: null,
          total: 10,
          unreviewed: 1,
          uncertain: 4,
          confirmed: 3,
          rejected: 2
        }
      ]
    }
  }
})

export const getDetections = vi.fn(async (): Promise<WithTotalCount<CoreDetection[]>> => {
  return {
    total: 8,
    data: [
      {
        id: '19919234',
        stream_id: 'kdibkrnfh84k',
        start: '2022-01-01T00:00:00.000+0700',
        end: '2022-01-01T00:00:05.000+0700',
        classifier_id: 19,
        confidence: 0.984947475,
        review_status: null,
        classification: {
          title: 'Schelrus Carolinensis simple call 1',
          value: 'schelrus_carolinensis_simple_call_1',
          image: null
        }
      },
      {
        id: '19919235',
        stream_id: 'kdibkrnfh84k',
        start: '2022-01-01T00:00:05.000+0700',
        end: '2022-01-01T00:00:10.000+0700',
        classifier_id: 19,
        confidence: 0.984947475,
        review_status: -1,
        classification: {
          title: 'Schelrus Carolinensis simple call 1',
          value: 'schelrus_carolinensis_simple_call_1',
          image: null
        }
      },
      {
        id: '19919236',
        stream_id: 'kdibkrnfh84k',
        start: '2022-01-01T00:00:10.000+0700',
        end: '2022-01-01T00:00:15.000+0700',
        classifier_id: 19,
        confidence: 0.984947475,
        review_status: 0,
        classification: {
          title: 'Schelrus Carolinensis simple call 1',
          value: 'schelrus_carolinensis_simple_call_1',
          image: null
        }
      },
      {
        id: '19919237',
        stream_id: 'kdibkrnfh84k',
        start: '2022-01-01T00:00:15.000+0700',
        end: '2022-01-01T00:00:20.000+0700',
        classifier_id: 19,
        confidence: 0.984947475,
        review_status: 1,
        classification: {
          title: 'Schelrus Carolinensis simple call 1',
          value: 'schelrus_carolinensis_simple_call_1',
          image: null
        }
      }
    ]
  }
})

export const getClassifiers = vi.fn(async (): Promise<Classifier[]> => {
  return [
    {
      id: 1,
      name: 'asia-elephant-edge',
      version: 5
    },
    {
      id: 2,
      name: 'asia-elephant-edge',
      version: 4
    },
    {
      id: 3,
      name: 'gunshot',
      version: 1
    },
    {
      id: 4,
      name: 'pr-parrot',
      version: 2
    },
    {
      id: 5,
      name: 'pr-parrot',
      version: 1
    }
  ]
})

export const updateDetectionStatus = vi.fn(async (): Promise<CoreUpdateDetectionsStatusResponse> => {
  return [
    {
      id: '1221017',
      status: 'confirmed'
    }
  ]
})

export const updateClassifierJob = vi.fn(async (): Promise<void> => {})

export const createClassifierJob = vi.fn(async (): Promise<string> => {
  return '/classifier-jobs/121'
})

export const getDetectionsSummary = vi.fn(async (): Promise<CoreDetectionsSummary> => {
  return {
    unreviewed: 30,
    rejected: 0,
    uncertain: 12,
    confirmed: 8
  }
})

export const getClassifierJobSummaryByClassification = vi.fn(async (): Promise<CoreClassifierJobSummary & CoreClassificationLite> => {
  return {
    value: 'sciurus_carolinensis_simple_call_2',
    title: 'Sciurus carolinensis, Simple call 2',
    image: null,
    total: 1732,
    unreviewed: 1730,
    uncertain: 2,
    rejected: 0,
    confirmed: 0
  }
})

export const getBestDetections = vi.fn(async (): Promise<WithTotalCount<CoreBestDetection[]>> => {
  return {
    total: 280,
    data: [
    {
      id: '592123',
      stream_id: 'kdmfigkritu0',
      classifier_id: 39,
      start: '2024-03-18T12:25:00.000Z',
      end: '2024-03-18T12:30:00.000Z',
      confidence: 0.99234,
      review_status: null,
      classification: {
        value: 'paryrus_supaman_simple_call_2',
        title: 'Paryrus Supaman, Simple call 2',
        image: null
      },
      bestDetection: {
        daily_ranking: 1,
        stream_ranking: 1
      }
    }
  ]
}
})
