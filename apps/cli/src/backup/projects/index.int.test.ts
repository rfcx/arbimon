import dayjs from 'dayjs'
import { describe, expect, test, vi } from 'vitest'

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
        const project = await LocationProject.findOne()
        const user = await UserProfile.findOne()
        if (user === null || project === null) throw Error('User & project required')
        const backup = { entityId: project.id, entity: 'project' as BackupType, status: BackupStatus.REQUESTED, requestedBy: user.id, requestedAt: new Date() }
        await Backup.create(backup)
        const date = dayjs().format('YYYY-MM-DD')
        const expectedName = `${project.slug}_${date}_export.zip`
        const expectedKey = `exports/${project.id}/${expectedName}`

        // Act
        await backupProjects(sequelize, arbimonSequelize, storage, storage, mailClient, false)

        // Assert
        const exists = await storage.objectExists(expectedKey)
        expect(exists).toBe(true)
    })
})
