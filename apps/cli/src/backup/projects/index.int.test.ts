import dayjs from 'dayjs'
import { describe, expect, test, vi } from 'vitest'
import yauzl from 'yauzl'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type BackupType, BackupStatus } from '@rfcx-bio/node-common/dao/types/backup'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getMailClient } from '~/mail'
import { getStorageClient } from '~/storage'
import { backupProjects } from './index'

vi.mock('~/mail')

const sequelize = getSequelize()
const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const storage = getStorageClient()
const mailClient = getMailClient()

describe('Projects backup', async () => {
  test('generates and zips files', async () => {
    // Arrange
    const { Backup, LocationProject, UserProfile } = ModelRepository.getInstance(sequelize)
    const project = await LocationProject.findOne({ where: { id: 201 } })
    const user = await UserProfile.findOne()
    if (user === null || project === null) throw Error('User & project required')
    const backup = {
      entityId: project.id,
      entity: 'project' as BackupType,
      status: BackupStatus.REQUESTED,
      requestedBy: user.id,
      requestedAt: new Date()
    }
    await Backup.create(backup)
    const date = dayjs().format('YYYY-MM-DD')
    const expectedName = `${project.slug}_${date}_export.zip`
    const expectedKey = `exports/${project.id}/${expectedName}`

    // Act
    await backupProjects(sequelize, arbimonSequelize, storage, storage, mailClient, true)

    // Assert
    const exists = await storage.objectExists(expectedKey)
    expect(exists).toBe(true)

    const entries: string[] = []

    const zipBuffer = await storage.getObject(expectedKey)
    yauzl.fromBuffer(zipBuffer as Buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        throw err
      }

      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        entries.push(entry.fileName)
        zipfile.readEntry()
      })
      zipfile.on('end', () => {
        expect(entries).toContain('sites.0001.csv')
        expect(entries).toContain('species.0001.csv')
        expect(entries).toContain('recordings.0001.csv')
        expect(entries).toContain('playlists.0001.csv')
        expect(entries).toContain('playlist_recordings.0001.csv')
        expect(entries).toContain('templates.0001.csv')
        expect(entries).toContain('recording_validations.0001.csv')
        expect(entries).toContain('pattern_matching_rois.0001.csv')
        expect(entries).toContain('soundscapes.0001.csv')
        expect(entries).toContain('rfm_models.0001.csv')
        expect(entries).toContain('rfm_classifications.0001.csv')
      })
    })
  }, 30_000)
})
