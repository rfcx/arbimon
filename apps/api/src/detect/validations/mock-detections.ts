import { type SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

export const mockDetections: SpeciesDetection[] = [
  {
    jobId: 1,
    siteId: 'lgndfyp1enmu',
    dateStart: '2022-01-14T15:56:22.04Z',
    dateEnd: '2022-01-14T15:56:24.04Z',
    classifierId: 1,
    classificationId: 1,
    confidence: 0.6,
    statusId: 0
  },
  {
    jobId: 1,
    siteId: 'lgndfyp1enmu',
    dateStart: '2022-01-15T16:56:22.04Z',
    dateEnd: '2022-01-15T16:56:24.04Z',
    classifierId: 1,
    classificationId: 1,
    confidence: 0.99,
    statusId: 0
  },
  {
    jobId: 1,
    siteId: 'ev69cht895gc',
    dateStart: '2022-01-14T17:30:22.04Z',
    dateEnd: '2022-01-14T17:30:24.04Z',
    classifierId: 1,
    classificationId: 2,
    confidence: 0.975,
    statusId: 0
  },
  {
    jobId: 1,
    siteId: 'lgndfyp1enmu',
    dateStart: '2022-01-14T17:35:00.04Z',
    dateEnd: '2022-01-14T17:35:02.04Z',
    classifierId: 1,
    classificationId: 2,
    confidence: 0.75,
    statusId: 0
  }
]
