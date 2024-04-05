import { type Sequelize, Op } from 'sequelize'

import {buildVariantPath, isS3Image} from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { resizeImage } from '@rfcx-bio/common/image'
import { type StorageClient } from '@rfcx-bio/common/storage'

export const PROJECT_IMAGE_CONFIG = {
    thumbnail: {
        width: 144,
        height: 144,
        // 7 days
        cacheControl: 'max-age=604800, s-maxage=604800'
    }
}

export const generateProjectThumbnails = async (sequelize: Sequelize, storage: StorageClient): Promise<void> => {
    // get projects with image
    const models = ModelRepository.getInstance(sequelize)
    const projects = await models.LocationProject.findAll({
        where: {
            image: {
                [Op.not]: null
            }
        },
        attributes: ['image'],
        raw: true
    })
    // go through projects
    // TODO add batching
    for (const project of projects) {
        const { image = '' } = project

        if (isS3Image(image)) {
            const thumbnailPath = buildVariantPath(image, 'thumbnail')
            // check if thumbnail exists - get object
            const thumbnailExists = await storage.objectExists(thumbnailPath)
            if (!thumbnailExists) {
                // get image
                const original = await storage.getObject(image)
                // TODO get metadata from original to get content type
                const mimetype = ''
                // generate thumbnail from original
                const { width, height, cacheControl } = PROJECT_IMAGE_CONFIG.thumbnail
                const thumbnail = await resizeImage(original, { width, height })
                // save thumbnail
                await storage.putObject(thumbnailPath, thumbnail, mimetype, true, { CacheControl: cacheControl })
            }
        }
    }
}
