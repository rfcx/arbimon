import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { getStorageClient } from '~/storage'
import { backupProjects } from './projects'
import { getMailClient } from '~/mail'

const main = async (): Promise<void> => {
    console.info('Backup processing start...')

    try {
        const sequelize = getSequelize()
        const arbimonSequelize = getArbimonSequelize()
        const storage = getStorageClient()
        const mailClient = getMailClient()

        // Process project backup requests
        await backupProjects(sequelize, arbimonSequelize, storage, mailClient)
        console.info('Backup processing end: success')
    } catch (e) {
        console.error(e)
        process.exitCode = 1
        console.info('Backup processing end: failed')
    }
}

await main()
