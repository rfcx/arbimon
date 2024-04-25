import { describe, expect, test } from 'vitest'

import {backupProjects} from '@/backup/projects'
import { getSequelize } from '@/db/connections'
import { getStorageClient } from '~/storage'

const sequelize = getSequelize()
const storage = getStorageClient()

describe('Projects backup', async () => {
    test.skip('generates and zips files', async () => {
        // TODO
        // const res = await backupProjects(sequelize, storage)
        // expect(res).toBe(1)
    }, 200000)
})
