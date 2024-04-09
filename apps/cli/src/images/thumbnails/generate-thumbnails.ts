import { BATCH_LIMIT, PROJECT_IMAGE_CONFIG } from 'images/config'
import { type Sequelize, Op } from 'sequelize'

import { buildVariantPath, isS3Image } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { resizeImage } from '@rfcx-bio/common/image'
import { type GetObjectResponse, type StorageClient } from '@rfcx-bio/common/storage'

/**
 * Generates thumbnails from original project images
 *
 * @param sequelize {Sequelize} - ORM instance
 * @param storage {StorageClient} - Storage instance
 * @param verbose {boolean} - logging flag
 */
export const generateProjectThumbnails = async (sequelize: Sequelize, storage: StorageClient, verbose: boolean = false): Promise<void> => {
    let offset = 0
    let responseCount = 1
    const projects = []

    // Get projects with image
    const models = ModelRepository.getInstance(sequelize)
    while (responseCount !== 0) {
        try {
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

            responseCount = response?.length
            projects.push(...response)
        } catch (e) {
            if (verbose) {
                console.info(`Error fetching batch with offset ${offset} and batch size ${BATCH_LIMIT}: `, e)
            }
        } finally {
            offset += BATCH_LIMIT
        }
    }

    // Go through projects
    for (const project of projects) {
        try {
            const { image = '' } = project

            if (isS3Image(image)) {
                const thumbnailPath = buildVariantPath(image, 'thumbnail')
                // Check if thumbnail exists in storage
                const thumbnailExists = await storage.objectExists(thumbnailPath)
                if (!thumbnailExists) {
                    // Fetch original image
                    const {
                        file: original,
                        metadata: { ContentType = '' } = {}
                    } = await storage.getObject(image, true) as GetObjectResponse
                    // Generate thumbnail from original
                    const { width, height, CacheControl, ACL } = PROJECT_IMAGE_CONFIG.thumbnail
                    const thumbnail = await resizeImage(original, { width, height })
                    // Save thumbnail to storage
                    await storage.putObject(thumbnailPath, thumbnail, { ACL, CacheControl, ContentType })
                }
            }
        } catch (e) {
            if (verbose) {
                console.info(`Error generating project thumbnail from ${project?.image}`, e)
            }
        }
    }
}
