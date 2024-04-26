import { describe, expect, test } from 'vitest'

import {backupProjects} from '@/backup/projects'
import { getSequelize } from '@/db/connections'
import { getStorageClient } from '~/storage'

const sequelize = getSequelize()
const storage = getStorageClient()

describe('Projects backup', async () => {
    test('generates and zips files', async () => {
        const name = 'bci-panama_2024-4-26_export.zip'
        const key = `exports/2/2024-4-26/${name}`
        // Act
        await backupProjects(sequelize, storage)

        const res = await storage.getObject(key, true)
        expect(res).toBe(1)
    }, 200000)
})
