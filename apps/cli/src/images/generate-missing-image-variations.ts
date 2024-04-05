import { getSequelize } from '@/db/connections'
import { generateProjectThumbnails } from '@/images/thumbnails/generate-thumbnails'
import { getStorageClient } from '~/storage'

const main = async (): Promise<void> => {
    console.info('Image generation start')

    try {
        const sequelize = getSequelize()
        const storage = getStorageClient()
        // Generate thumbnail images
        await generateProjectThumbnails(sequelize, storage)
    } catch (e) {
        console.error(e)
        process.exitCode = 1
        console.info('Image generation end: failed')
    }
}

await main()
