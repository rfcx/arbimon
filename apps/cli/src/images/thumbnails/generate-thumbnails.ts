import { BATCH_LIMIT, PROJECT_IMAGE_CONFIG } from 'images/config'
import { type Sequelize, Op } from 'sequelize'

import { buildVariantPath, isS3Image } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { resizeImage } from '@rfcx-bio/common/image'
import { type GetObjectResponse, type StorageClient } from '@rfcx-bio/common/storage'

/**
 * Fetches projects and generates thumbnails from original images
 *
 * @param sequelize - ORM instance
 * @param storage - Storage instance
 */
export const generateProjectThumbnails = async (sequelize: Sequelize, storage: StorageClient): Promise<void> => {
    let offset = 0
    let responseCount = 1
    const projects = []

    // Get projects with image
    const models = ModelRepository.getInstance(sequelize)
    while (responseCount !== 0) {
        const response = await models.LocationProjectProfile.findAll({
            where: {
                image: {
                    [Op.not]: null
                }
            },
            limit: BATCH_LIMIT,
            offset,
            attributes: ['image'],
            raw: true
        })

        offset += BATCH_LIMIT
        responseCount = response.length
        projects.push(...response)
    }

    // Go through projects
    for (const project of projects) {
        const { image = '' } = project

        if (isS3Image(image)) {
            const thumbnailPath = buildVariantPath(image, 'thumbnail')
            // Check if thumbnail exists in storage
            const thumbnailExists = await storage.objectExists(thumbnailPath)
            if (!thumbnailExists) {
                // Fetch original image
                const { file: original, metadata: { ContentType = '' } = {} } = await storage.getObject(image, true) as GetObjectResponse
                // Generate thumbnail from original
                const { width, height, CacheControl, ACL } = PROJECT_IMAGE_CONFIG.thumbnail
                const thumbnail = await resizeImage(original, { width, height })
                // Save thumbnail to storage
                await storage.putObject(thumbnailPath, thumbnail, { ACL, CacheControl, ContentType })
            }
        }
    }
}
