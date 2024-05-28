import { type ConsolaInstance } from 'consola'
import { createConsola } from 'consola'
import dayjs from 'dayjs'
import { sample } from 'lodash-es'
import { access, rm } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { modelRepositoryWithElevatedPermissions } from '@/../../../packages/testing/src/dao'
import { getSequelize } from '@/db/connections'
import { ApiCoreClient } from '~/api-core/api-core-client'
import { requireEnv } from '~/env'
import { getMailClient } from '~/mail'
import { getStorageClient } from '~/storage'
import { exportDetections } from './detections'
import { type Detection, CSV_REVIEW_STATUS } from './detections/core-api'

vi.mock('../_services/mail')

const { AUTHO_ANONYMOUS_CLIENT_SECRET } = requireEnv('AUTHO_ANONYMOUS_CLIENT_SECRET')

const sequelize = getSequelize()
const mailClient = getMailClient()
const apiClient = ApiCoreClient.getInstance(AUTHO_ANONYMOUS_CLIENT_SECRET)
const consola = createConsola({ fancy: false })
const storage = getStorageClient()

const { UserProfile } = modelRepositoryWithElevatedPermissions

const intBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const generateFakeDetections = (start: string, end: string, count: number): Detection[] => {
  const startTime = dayjs(start).unix()
  const endTime = dayjs(end).unix()

  return Array.from({ length: count }, () => {
    const randomUnixTime = intBetween(startTime * 1000, endTime * 1000)
    const startTimeIso = dayjs(randomUnixTime).toISOString()
    const endTimeIso = dayjs(randomUnixTime).add(5, 'seconds').toISOString()

    return {
      site_id: 'bi3mkd9fkbl2',
      site_name: 'BI12',
      detection_start: startTimeIso,
      detection_end: endTimeIso,
      detection_class: 'vulgaris_simple_call_2',
      confidence: Math.random(),
      validation_status: sample(CSV_REVIEW_STATUS) ?? '-'
    }
  })
}

vi.mock('./detections/core-api', () => {
  return {
    getDetections: vi.fn(async (_client: any, _jobId: number, start: string, end: string, _consola: ConsolaInstance) => {
      if (start === '2023-12-30' && end === '2024-01-09') {
        return generateFakeDetections(start, end, 7000)
      }

      if (start === '2023-05-30' && end === '2023-06-14') {
        return generateFakeDetections(start, end, 6500)
      }

      if (start === '2023-06-14' && end === '2023-06-29') {
        return generateFakeDetections(start, end, 3500)
      }

      if (start === '2023-06-29' && end === '2023-07-02') {
        return generateFakeDetections(start, end, 2800)
      }

      return generateFakeDetections(start, end, 1)
    }),
    fetchClassifierJob: vi.fn(async (_client: any, jobId: number) => {
      if (jobId === 100) {
        return {
          id: 100,
          queryStart: '2024-01-01',
          queryEnd: '2024-01-07',
          projectId: '128mkldkfoor'
        }
      }

      if (jobId === 101) {
        return {
          id: 101,
          queryStart: '2023-06-01',
          queryEnd: '2023-06-30',
          projectId: 'kmdkfdlsdf'
        }
      }

      return {
        id: 999,
        queryStart: '2022-01-01',
        queryEnd: '2022-01-01',
        projectId: 'lsdkfmdkfib'
      }
    })
  }
})

const email = 'lasagnafavourites1218@rfcx.org'

beforeAll(async () => {
  try {
    await rm('/tmp/rfcx', { recursive: true })
  } catch (e) {
    // @ts-expect-error unknown type
    if (e.code === 'ENOENT') {
      consola.warn('/tmp/rfcx has been removed')
    } else {
      throw e
    }
  }

  await UserProfile.create({
    idAuth0: 'auth0|whoisthisguy',
    email,
    firstName: 'Lando',
    lastName: 'Norris'
  })
})

afterAll(async () => {
  try {
    await rm('/tmp/rfcx', { recursive: true })
  } catch (e) {
    // @ts-expect-error unknown type
    if (e.code === 'ENOENT') {
      consola.warn('/tmp/rfcx has been removed')
    } else {
      throw e
    }
  }

  await UserProfile.destroy({
    where: { email },
    force: true
  })
})

describe('export detections folder', () => {
  test('can correctly export files when detections are under the threshold for the file', async () => {
    // Act
    await exportDetections(
      email,
      '100',
      'all-model-detections',
      apiClient,
      sequelize,
      storage,
      mailClient,
      consola
    )

    // Assert
    // Checks the folder exists inside tmp directory
    await expect(access('/tmp/rfcx/export-detections-128mkldkfoor-100')).resolves.toBeUndefined()
    // Checks the exported file exists
    await expect(access('/tmp/rfcx/export-detections-128mkldkfoor-100/all-model-detections/detections_001.csv')).resolves.toBeUndefined()
    // Checks the exported zip file exists
    await expect(access('/tmp/rfcx/export-detections-128mkldkfoor-100/detections_export_128mkldkfoor_100.zip')).resolves.toBeUndefined()

    // Checks the file has been updated to S3
    const s3File = await storage.getObject('classifier-job-exports/100/detections_export_128mkldkfoor_100.zip') as Buffer
    expect(s3File).toBeDefined()
  })

  test('can correctly export files as steps when they are more than page limit', async () => {
    // Act
    await exportDetections(
      email,
      '101',
      'all-model-detections',
      apiClient,
      sequelize,
      storage,
      mailClient,
      consola
    )

    // Assert
    await expect(access('/tmp/rfcx/export-detections-kmdkfdlsdf-101')).resolves.toBeUndefined()
    await expect(access('/tmp/rfcx/export-detections-kmdkfdlsdf-101/all-model-detections/detections_001.csv')).resolves.toBeUndefined()
    await expect(access('/tmp/rfcx/export-detections-kmdkfdlsdf-101/all-model-detections/detections_002.csv')).resolves.toBeUndefined()
    await expect(access('/tmp/rfcx/export-detections-kmdkfdlsdf-101/all-model-detections/detections_003.csv')).rejects.toThrowError()
    await expect(access('/tmp/rfcx/export-detections-kmdkfdlsdf-101/detections_export_kmdkfdlsdf_101.zip')).resolves.toBeUndefined()

    const s3File = await storage.getObject('classifier-job-exports/101/detections_export_kmdkfdlsdf_101.zip') as Buffer
    expect(s3File).toBeDefined()
  })
})
