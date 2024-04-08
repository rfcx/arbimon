import { PROJECT_IMAGE_CONFIG } from 'images/config'
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
    // Get projects with image
    const models = ModelRepository.getInstance(sequelize)
    // TODO add batching
    const projects = await models.LocationProjectProfile.findAll({
        where: {
            image: {
                [Op.not]: null
            }
        },
        attributes: ['image'],
        raw: true
    })
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
