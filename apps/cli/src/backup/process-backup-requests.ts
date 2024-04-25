import { backupProjects } from '@/backup/projects'
import { getSequelize } from '@/db/connections'
import { getStorageClient } from '~/storage'

const main = async (): Promise<void> => {
    console.info('Backup processing start...')

    try {
        const sequelize = getSequelize()
        const storage = getStorageClient()

        // Process project backups
        await backupProjects(sequelize, storage)
    } catch (e) {
        console.error(e)
        process.exitCode = 1
        console.info('Backup processing end: failed')
    }
}

await main()
